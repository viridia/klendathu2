import * as r from 'rethinkdb';
import { CustomField, Issue, IssueLink, Predicate, Relation, Role } from '../../../common/api';
import Context from '../context/Context';
import { escapeRegExp } from '../db/helpers';
import {
  CustomValues, IssueChangeRecord, IssueId, IssueLinkRecord, IssueRecord,
} from '../db/types';
import {
  ErrorKind,
  Forbidden,
  InternalError,
  NotFound,
  ResolverError,
  // Unauthorized,
} from '../errors';
import { logger } from '../logger';
import { getProjectAndRole } from './role';

interface CustomSearch {
  name: string;
  value: string;
  values: string[];
}

const VALID_SORT_KEYS = new Set([
  'id',
  'type',
  'state',
  'summary',
  'description',
  'created',
  'updated',
  'owner',
  'reporter',
]);

function stringPredicate(field: string, pred: Predicate, value: string): r.Expression<boolean> {
  switch (pred) {
    case Predicate.IN:
      return (r.row(field) as any).match(`(?i)${escapeRegExp(value)}`);
    case Predicate.EQUALS:
      return r.row(field).eq(value);
    case Predicate.NOT_IN:
      return (r.row(field) as any).match(`(?i)${escapeRegExp(value)}`).not();
    case Predicate.NOT_EQUALS:
      return r.row(field).ne(value);
    case Predicate.STARTS_WITH:
      return (r.row(field) as any).match(`^(?i)${escapeRegExp(value)}`);
    case Predicate.ENDS_WITH:
      return (r.row(field) as any).match(`(?i)${escapeRegExp(value)}$`);
    default:
      logger.error('Invalid string predicate:', pred);
      return null;
  }
}

function inverseRelation(relation: Relation): Relation {
  switch (relation) {
    case Relation.BLOCKED_BY: return Relation.BLOCKS;
    case Relation.BLOCKS: return Relation.BLOCKED_BY;
    case Relation.INCLUDED_BY: return Relation.INCLUDES;
    case Relation.INCLUDES: return Relation.INCLUDED_BY;
    default:
      return relation;
  }
}

function customArrayToMap(custom: CustomField[]): CustomValues {
  const result: CustomValues = {};
  custom.forEach(({ name, value }) => { result[name] = value; });
  return result;
}

// Make sure all of the issues we are linking to are valid.
async function checkLinked(
    conn: r.Connection,
    project: string,
    linked: IssueLink[],
  ): Promise<any> {
  const keyIds = new Set(linked.map(id => id.to));
  const keys: IssueId[] = Array.from(Array.from(keyIds).map(id => IssueId(project, id)));
  const rows = await r.table('issues')
      .getAll(...keys as any)
      .run(conn).
      then(cursor => cursor.toArray());
  if (rows.length !== keyIds.size) {
    throw new InternalError(ErrorKind.INVALID_LINK);
  }
}

// Queries involving issues
export const queries = {
  async issue(_: any, args: { project: string, id: number }, context: Context): Promise<Issue> {
    const { project, role } = await getProjectAndRole(context, args.project, undefined, true);
    if (!project || (!project.isPublic && role < Role.VIEWER)) {
      if (project) {
        logger.error('Access denied querying project', args, context.user);
      }
      throw new NotFound({ notFound: 'project' });
    }
    const issue = await r.table('issues').get([args.project, args.id] as any)
        .run(context.conn) as any as Issue;
    // If they are not a project member, only allow public issues to be viewed.
    if (role < Role.VIEWER && !issue.isPublic) {
      return null;
    }
    return issue;
  },

  async issues(
    _: any,
    args: {
      project: string,
      search?: string,
      type: string[],
      state: string[],
      owner: string[],
      reporter: string[],
      cc: string[],
      summary: string,
      summaryPred: Predicate,
      description: string,
      descriptionPred: Predicate,
      labels: number[],
      linked: number[],
      comment: string,
      commentPred: Predicate,
      custom: CustomSearch[],
      sort: string[],
      subtasks: boolean,
    },
    context: Context,
  ): Promise<Issue[]> {
    const { project, role } = await getProjectAndRole(context, args.project, undefined, true);
    if (!project || (!project.isPublic && role < Role.VIEWER)) {
      throw new NotFound({ notFound: 'project' });
    }

    // let query = r.table('labels').filter((r.row('id') as any).nth(0).eq(args.project));
    let query = r.table('issues').filter((r.row('id') as any).nth(0).eq(args.project));

    // Build the query expression
    const filters: Array<r.Expression<boolean>> = [];

    // If they are not a project member, only allow public issues to be viewed.
    if (role < Role.VIEWER) {
      filters.push(r.row('isPublic'));
    }

    if (args.search) {
      const re = `(?i)\\b${escapeRegExp(args.search)}`;
      filters.push((r as any).or(
        (r.row('summary') as any).match(re),
        (r.row('description') as any).match(re),
        // TODO: other fields - comments, etc.
      ));
    }

    if (args.type) {
      if (args.type.length === 1) {
        filters.push(r.row('type').eq(args.type[0]));
      } else {
        filters.push((r.row('type') as any)
            .do((type: string) => r.expr(args.type).contains(type)));
      }
    }

    if (args.state) {
      if (args.state.length === 1) {
        filters.push(r.row('state').eq(args.state[0]));
      } else {
        filters.push((r.row('state') as any)
            .do((state: string) => r.expr(args.state).contains(state)));
      }
    }

    if (args.summary) {
      const test = stringPredicate('summary', args.summaryPred, args.summary);
      if (!test) {
        throw new ResolverError(ErrorKind.INVALID_PREDICATE);
      }
      filters.push(test);
    }

    if (args.description) {
      const test = stringPredicate('description', args.descriptionPred, args.description);
      if (!test) {
        throw new ResolverError(ErrorKind.INVALID_PREDICATE);
      }
      filters.push(test);
    }

    if (args.reporter) {
      filters.push((r.row('reporter') as any)
          .do((reporter: string) => r.expr(args.reporter).contains(reporter)));
    }

    if (args.owner) {
      filters.push((r.row('owner') as any)
          .do((owner: string) => r.expr(args.owner).contains(owner)));
    }

    // Must match *all* labels
    if (args.labels) {
      for (const label of args.labels) {
        filters.push(r.row('labels').contains(label as any));
      }
    }

  //   // Other things we might want to search by:
  //   // cc
  //   // comments / commenter
  //   // created (date range)
  //   // updated

    if (args.custom) {
      for (const term of args.custom) {
        const { name, value, values } = term;
        if (value) {
          filters.push((r.row('custom')(name) as any).match(`(?i)${escapeRegExp(value)}`));
        } else if (values) {
          // for (const v of values) {
          //   filters.push((r.row('custom')(name) as any).match(`(?i)${escapeRegExp(v)}`));
          // }
        }
      }
    }

    if (filters.length > 0) {
      query = query.filter((r as any).and(...filters));
    }

    let sort = [r.desc('id')];
    if (args.sort) {
      // console.info(req.sort);
      sort = [];
      for (let sortKey of args.sort) {
        let desc = false;
        if (sortKey.startsWith('-')) {
          sortKey = sortKey.slice(1);
          desc = true;
        }
        if (!VALID_SORT_KEYS.has(sortKey)) {
          if (!sortKey.startsWith('custom.')) {
            throw new ResolverError(ErrorKind.INVALID_SORT_KEY);
          }
        }
        if (desc) {
          sort.push(r.desc(sortKey));
        } else {
          sort.push(r.asc(sortKey));
        }
      }
    }

    const issues = await query.orderBy(...sort).run(context.conn);
  //   if (req.subtasks) {
  //     return this.findSubtasks(query, sort);
  //   }
    return issues.toArray();
  },
};

export const mutations = {
  async newIssue(
      _: any,
      args: { project: string, input: Issue },
      context: Context,
  ): Promise<IssueRecord> {
    const { project, role } = await getProjectAndRole(context, args.project, undefined, true);
    if (project === null || (!project.isPublic && role < Role.VIEWER)) {
      if (project) {
        logger.error('Access denied creating issue', args, context.user);
      }
      throw new NotFound({ notFound: 'project' });
    } else if (role < Role.REPORTER) {
      throw new Forbidden();
    } else if (!args.input.type || !args.input.state || !args.input.summary) {
      throw new ResolverError(ErrorKind.MISSING_FIELD);
    }

    // Increment the issue id counter.
    const resp: any = await r.table('projects').get(project.id).update({
      issueIdCounter: r.row('issueIdCounter').add(1),
    }, {
      returnChanges: true,
    }).run(context.conn);
    if (resp.replaced !== 1) {
      console.log(resp);
      throw new InternalError({ error: 'issue-counter' });
    }

    // TODO: ensure reporter is valid
    // TODO: ensure ccs are valid
    // TODO: ensure labels are valid
    // TODO: ensure attachments are valid

    // Populate the issue record
    const now = new Date();
    let commentIndex = 0;
    const record: IssueRecord = {
      id: [args.project, resp.changes[0].new_val.issueIdCounter],
      type: args.input.type,
      state: args.input.state,
      summary: args.input.summary,
      description: args.input.description,
      reporter: context.user.id,
      owner: args.input.owner || null,
      created: now,
      updated: now,
      cc: (args.input.cc || []),
      labels: args.input.labels || [],
      // linked: (args.issue.linked || []).map(convertLink),
      custom: args.input.custom ? customArrayToMap(args.input.custom) : {},
      attachments: args.input.attachments || [],
      isPublic: !!args.input.isPublic,
      comments: (args.input.comments || []).map(comment => ({
        id: () => { commentIndex += 1; return commentIndex; },
        body: comment.body,
        author: this.user.username,
        created: now,
        updated: now,
      })),
    };

    const result = await r.table('issues')
        .insert(record, { returnChanges: true })
        .run(context.conn);
    if (result.inserted === 1) {
      const row: IssueRecord = (result as any).changes[0].new_val;
      if (args.input.linked && args.input.linked.length > 0) {
        await checkLinked(context.conn, args.project, args.input.linked);
        const linksToInsert: IssueLinkRecord[] = [];
        const changesToInsert: IssueChangeRecord[] = [];
        for (const link of args.input.linked) {
          linksToInsert.push({
            project: row.id[0],
            from: row.id[1],
            to: link.to,
            relation: link.relation,
          });
          changesToInsert.push({
            project: row.id[0],
            issue: row.id[1],
            by: context.user.id,
            at: now,
            linked: [{ to: link.to, after: link.relation }],
          });
          const inv = inverseRelation(link.relation);
          linksToInsert.push({
            project: row.id[0],
            from: link.to,
            to: row.id[1],
            relation: inv,
          });
          changesToInsert.push({
            project: row.id[0],
            issue: link.to,
            by: context.user.id,
            at: now,
            linked: [{ to: row.id[1], after: inv }],
          });
        }
        await r.table('issueLinks').insert(linksToInsert).run(context.conn);
        await r.table('issueChanges').insert(changesToInsert).run(context.conn);
      }
      return row;
    } else if (result.errors > 0) {
      logger.error('Error creating issue', result.first_error);
      throw new InternalError({ error: result.first_error });
    } else {
      logger.error('Error: issue not created.');
      throw new InternalError({ error: 'no-insert' });
    }
  },

  async updateIssue(
      _: any,
      args: { project: string, id: number, input: Issue },
      context: Context,
  ): Promise<IssueRecord> {
    const { project, role } = await getProjectAndRole(context, args.project, undefined, true);
    if (project === null || (!project.isPublic && role < Role.VIEWER)) {
      if (project) {
        logger.error('Access denied updating issue', args, context.user);
      }
      throw new NotFound({ notFound: 'project' });
    } else if (role < Role.UPDATER) {
      throw new Forbidden();
    }

    const record: Partial<IssueRecord> = {
      id: [args.project, args.id],
      updated: new Date(),
    };

    console.log(record);
    return null;
  },
};

export const types = {
  Issue: {
    id(issue: IssueRecord) { return issue.id[1]; },
    project(issue: IssueRecord) { return issue.id[0]; },
    linked(issue: IssueRecord, _: any, context: Context): Promise<IssueLink[]> {
      return r.table('issueLinks').filter({
        project: issue.id[0],
        from: issue.id[1],
      }).run(context.conn)
      .then(cursor => cursor.toArray());
    },
    // linked
    // changes
  },
};
