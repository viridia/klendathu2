import * as r from 'rethinkdb';
import { CustomField, Issue, IssueLink, Predicate, Relation, Role } from '../../../common/api';
import Context from '../context/Context';
import { escapeRegExp } from '../db/helpers';
import {
  CommentEntry,
  CustomFieldChange,
  CustomValues,
  IssueChangeRecord,
  IssueId,
  IssueLinkRecord,
  IssueRecord,
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
    case Relation.PART_OF: return Relation.HAS_PART;
    case Relation.HAS_PART: return Relation.PART_OF;
    default:
      return relation;
  }
}

function customArrayToMap(custom: CustomField[]): CustomValues {
  const result: CustomValues = {};
  custom.forEach(({ name, value }) => { result[name] = value; });
  return result;
}

function mapFromObject(obj: CustomValues): Map<string, string | number | boolean> {
  const map = new Map();
  Object.keys(obj).forEach(key => {
    map.set(key, obj[key]);
  });
  return map;
}

function sortedAndUnique<P>(items: P[]): P[] {
  const list = Array.from(new Set<P>(items));
  list.sort();
  return list;
}

function mapFromArray<K, V>(array: V[], keyFunc: (v: V) => K): Map<K, V> {
  return new Map(array.map(v => [keyFunc(v), v] as [K, V]));
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

    if (args.input.linked) {
      await checkLinked(context.conn, args.project, args.input.linked);
    }

    // TODO: ensure reporter is valid
    // TODO: ensure ccs are valid
    // TODO: ensure labels are valid
    // TODO: ensure attachments are valid

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

    // Populate the issue record
    const now = new Date();
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
      comments: (args.input.comments || []).map((comment, index) => ({
        id: index,
        body: comment.body,
        author: context.user.id,
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

    if (args.input.linked) {
      await checkLinked(context.conn, args.project, args.input.linked);
    }

    // TODO: ensure reporter is valid
    // TODO: ensure ccs are valid
    // TODO: ensure labels are valid
    // TODO: ensure attachments are valid

    const existing: IssueRecord = await r.table('issues')
        .get([args.project, args.id] as any).run(context.conn) as any;
    if (existing === null) {
      throw new NotFound({ notFound: 'issue' });
    }

    const record: Partial<IssueRecord> = {
      id: [args.project, args.id],
      updated: new Date(),
    };

    const change: IssueChangeRecord = {
      project: args.project,
      issue: args.id,
      by: context.user.id,
      at: null,
    };

    // Change type
    if (args.input.type !== undefined && args.input.type !== existing.type) {
      record.type = args.input.type;
      change.type = { before: existing.type, after: args.input.type };
      change.at = record.updated;
    }

    // Change state
    if (args.input.state !== undefined && args.input.state !== existing.state) {
      record.state = args.input.state;
      change.state = { before: existing.state, after: args.input.state };
      change.at = record.updated;
    }

    if (args.input.summary !== undefined && args.input.summary !== existing.summary) {
      record.summary = args.input.summary;
      change.summary = { before: existing.summary, after: args.input.summary };
      change.at = record.updated;
    }

    if (args.input.description !== undefined && args.input.description !== existing.description) {
      record.description = args.input.description;
      change.description = { before: existing.description, after: args.input.description };
      change.at = record.updated;
    }

    if (args.input.owner !== undefined && args.input.owner !== existing.owner) {
      record.owner = args.input.owner;
      change.owner = { before: existing.owner, after: args.input.owner };
      change.at = record.updated;
    }

    if (args.input.cc) {
      record.cc = sortedAndUnique(args.input.cc);
      const ccPrev = new Set(existing.cc);
      const ccNext = new Set(record.cc);
      args.input.cc.forEach(cc => ccPrev.delete(cc));
      existing.cc.forEach(cc => ccNext.delete(cc));
      if (ccNext.size > 0 || ccPrev.size > 0) {
        change.cc = { added: Array.from(ccNext), removed: Array.from(ccPrev) };
        change.at = record.updated;
      }
    }

    if (args.input.labels) {
      record.labels = sortedAndUnique(args.input.labels);
      const labelsPrev = new Set(existing.labels);
      const labelsNext = new Set(record.labels);
      args.input.labels.forEach(labels => labelsPrev.delete(labels));
      existing.labels.forEach(labels => labelsNext.delete(labels));
      if (labelsNext.size > 0 || labelsPrev.size > 0) {
        change.labels = { added: Array.from(labelsNext), removed: Array.from(labelsPrev) };
        change.at = record.updated;
      }
    }

    if (args.input.custom !== undefined) {
      record.custom = customArrayToMap(args.input.custom);
      const customPrev = mapFromObject(existing.custom);
      const customNext = mapFromObject(record.custom);
      const customChange: CustomFieldChange[] = [];
      customNext.forEach((value, name) => {
        if (customPrev.has(name)) {
          const before = customPrev.get(name);
          if (value !== before) {
            // A changed value
            customChange.push({ name, before, after: value });
          }
        } else {
          // A newly-added value
          customChange.push({ name, after: value });
        }
      });
      customPrev.forEach((value, name) => {
        if (!customNext.has(name)) {
          // A deleted value
          customChange.push({ name, before: value });
        }
      });
      if (customChange.length > 0) {
        change.custom = customChange;
        change.at = record.updated;
      }
    }

    if (args.input.attachments) {
      const existingAttachments = existing.attachments || [];
      record.attachments = args.input.attachments;
      const attachmentsPrev = new Set(existingAttachments);
      const attachmentsNext = new Set(args.input.attachments);
      args.input.attachments.forEach(attachments => attachmentsPrev.delete(attachments));
      existingAttachments.forEach(attachments => attachmentsNext.delete(attachments));
      if (attachmentsNext.size > 0 || attachmentsPrev.size > 0) {
        change.attachments = {
          added: Array.from(attachmentsNext),
          removed: Array.from(attachmentsPrev),
        };
        change.at = record.updated;
      }
    }

    // Patch comments list.
    // Note that we don't include comments in the change log since the comments themselves can
    // serve that purpose.
    if (args.input.comments !== undefined) {
      const commentMap = new Map<number, CommentEntry>();
      const commentList = [];
      let nextCommentIndex = 0;
      // Build a map of existing comments.
      if (existing.comments) {
        for (const c of existing.comments) {
          commentMap.set(c.id, c);
          commentList.push(c);
          nextCommentIndex = Math.max(nextCommentIndex, c.id);
        }
      }
      for (const c of args.input.comments) {
        if (c.id) {
          const oldComment = commentMap.get(c.id);
          // You can only modify your own comments.
          if (!oldComment) {
            throw new ResolverError(ErrorKind.INVALID_COMMENT_ID);
          } else if (oldComment.author === context.user.id) {
            oldComment.body = c.body;
            oldComment.updated = record.updated;
          }
        } else {
          // Insert a new comment from this author.
          nextCommentIndex += 1;
          commentList.push({
            id: nextCommentIndex,
            author: context.user.id,
            body: c.body,
            created: record.updated,
            updated: record.updated,
          });
        }
      }

      record.comments = commentList;
    }

    if (args.input.linked) {
      // Find all the link records (in both directions)
      const [fwdLinks, rvsLinks]: [IssueLinkRecord[], IssueLinkRecord[]] = await Promise.all([
        r.table('issueLinks').filter({ project: args.project, from: args.id })
            .run(context.conn)
            .then(cursor => cursor.toArray()),
        r.table('issueLinks').filter({ project: args.project, to: args.id })
            .run(context.conn)
            .then(cursor => cursor.toArray()),
      ]);
      const fwdMap = mapFromArray(fwdLinks, ln => ln.to);
      const rvsMap = mapFromArray(rvsLinks, ln => ln.from);
      const toInsert: IssueLinkRecord[] = [];
      const toRemove: IssueLinkRecord[] = [];
      const toUpdate: IssueLinkRecord[] = [];
      const changeRecords: IssueChangeRecord[] = [];
      change.linked = [];
      for (const lnk of args.input.linked) {
        const inv = inverseRelation(lnk.relation as Relation);
        const fwd = fwdMap.get(lnk.to);
        const rvs = rvsMap.get(lnk.to);
        // There's an existing link we need to update
        if (fwd) {
          // If the relationship changed
          if (fwd.relation !== lnk.relation) {
            // Add a change entry
            change.linked.push({
              to: lnk.to,
              before: fwd.relation,
              after: lnk.relation,
            });
            // Update the record
            fwd.relation = lnk.relation;
            toUpdate.push(fwd);
          }
        } else {
          // There was no existing link
          toInsert.push({
            project: args.project,
            from: args.id,
            to: lnk.to,
            relation: lnk.relation,
          });
          // Add a change entry for existing link
          change.linked.push({
            to: lnk.to,
            after: lnk.relation,
          });
        }

        // There's an existing inverse link
        if (rvs) {
          if (rvs.relation !== inv) {
            // Add a change record to the issue referenced in the inverse link
            changeRecords.push({
              project: args.project,
              by: context.user.id,
              issue: fwd.to,
              at: record.updated,
              linked: [{
                to: args.id,
                before: rvs.relation,
                after: inv,
              }],
            });

            // Update the inverse link
            rvs.relation = inv;
            toUpdate.push(rvs);
          }
        } else {
          // There was no inverse link, so create a new one
          toInsert.push({
            project: args.project,
            from: lnk.to,
            to: args.id,
            relation: inv,
          });
          // Create a change record for the new link
          changeRecords.push({
            project: args.project,
            by: context.user.id,
            issue: lnk.to,
            at: record.updated,
            linked: [{
              to: args.id,
              after: inv,
            }],
          });
        }
      }

      // Remove any entries from the maps that were maintained
      for (const lnk of args.input.linked) {
        fwdMap.delete(lnk.to);
        rvsMap.delete(lnk.to);
      }

      // Delete all forward links that weren't in the list
      for (const fwd of fwdMap.values()) {
        // Queue link for deletion
        toRemove.push(fwd);
        // Add a change entry no existing link
        change.linked.push({
          to: fwd.to,
          before: fwd.relation,
        });
      }

      // Delete all reverse links that weren't in the list
      for (const rvs of rvsMap.values()) {
        // Queue link for deletion
        toRemove.push(rvs);
        // Add a change entry no existing link
        changeRecords.push({
          project: args.project,
          by: context.user.id,
          issue: rvs.from,
          at: record.updated,
          linked: [{
            to: args.id,
            before: rvs.relation,
          }],
        });
      }

      if (change.linked.length > 0) {
        change.at = record.updated;
      }

      const promises: Array<Promise<any>> = [];
      if (toInsert) {
        promises.push(r.table('issueLinks').insert(toInsert).run(context.conn));
      }
      if (toRemove) {
        promises.push(r.table('issueLinks')
            .getAll(...toRemove.map(lnk => lnk.id))
            .delete().run(context.conn));
      }
      if (toUpdate) {
        for (const lnk of toUpdate) {
          promises.push(r.table('issueLinks')
              .get(lnk.id)
              .update(lnk).run(context.conn));
        }
      }
      if (changeRecords) {
        promises.push(r.table('issueChanges').insert(changeRecords).run(context.conn));

      }

      await Promise.all(promises);
    }

    if (change.at) {
      await r.table('issueChanges').insert(change).run(context.conn);
    }

    if (change.at || record.comments) {
      const result = await r.table('issues').update(record, { returnChanges: true })
          .run(context.conn);
      return (result as any).changes[0].new_val;
    }

    return existing;
  },

  async deleteIssue(
      _: any,
      args: { project: string, id: number },
      context: Context,
  ): Promise<number> {
    const { project, role } = await getProjectAndRole(context, args.project, undefined, true);
    if (project === null || (!project.isPublic && role < Role.VIEWER)) {
      if (project) {
        logger.error('Access denied updating issue', args, context.user);
      }
      throw new NotFound({ notFound: 'project' });
    } else if (role < Role.UPDATER) {
      throw new Forbidden();
    }

    const existing: IssueRecord = await r.table('issues')
        .get([args.project, args.id] as any).run(context.conn) as any;
    if (existing === null) {
      throw new NotFound({ notFound: 'issue' });
    }

    await r.table('issueChanges')
        .filter({ project: args.project, issue: args.id })
        .delete()
        .run(context.conn);
    await r.table('issuelinks')
        .filter({ project: args.project, to: args.id })
        .delete()
        .run(context.conn);
    await r.table('issuelinks')
        .filter({ project: args.project, from: args.id })
        .delete()
        .run(context.conn);
    await r.table('issues')
        .get([args.project, args.id] as any)
        .delete()
        .run(context.conn);

    return args.id;
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
      }).orderBy(r.asc('to')).run(context.conn)
      .then(cursor => cursor.toArray());
    },
    changes(issue: IssueRecord, _: any, context: Context): Promise<IssueChangeRecord[]> {
      return r.table('issueChanges').filter({
        project: issue.id[0],
        issue: issue.id[1],
      }).orderBy(r.desc('at')).run(context.conn)
      .then(cursor => cursor.toArray());
    },
    // changes
  },
};
