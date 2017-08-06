import * as r from 'rethinkdb';
import { Role } from '../../../common/api';
import Context from '../context/Context';
import { escapeRegExp } from '../db/helpers';
import { LabelRecord } from '../db/types';
import {
  ErrorKind,
  Forbidden,
  InternalError,
  NotFound,
  ResolverError,
  Unauthorized,
} from '../errors';
import { logger } from '../logger';
import { getProjectAndRole } from './role';

interface LabelInput {
  name?: string;
  color?: string;
}

// Queries involving projects
export const queries = {
  label(_: any, args: { project: string, id: number }, context: Context):
      Promise<LabelRecord | null> {
    return r.table('labels').get([args.project, args.id] as any).run(context.conn) as any;
  },

  labels(_: any, args: { project: string, token: string }, context: Context):
      Promise<LabelRecord[]> {
    let query = r.table('labels').filter((r.row('id') as any).nth(0).eq(args.project));
    if (args.token) {
      const pattern = `\\b${escapeRegExp(args.token)}`;
      query = query.filter({ name: { $regex: pattern, $options: 'i' } });
    }
    return query.run(context.conn).then(cursor => cursor.toArray());
  },
};

export const mutations = {
  async newLabel(
      _: any,
      args: { project: string, input: LabelInput },
      context: Context): Promise<LabelRecord> {
    if (!context.user) {
      throw new Unauthorized();
    }
    const { project, role } = await getProjectAndRole(context, args.project, undefined, true);
    if (!project || (!project.isPublic && role < Role.VIEWER)) {
      if (project) {
        logger.error(`newLabel: project ${args.project} not visible.`);
      } else {
        logger.error(`newLabel: project ${args.project} not found.`);
      }
      throw new NotFound({ notFound: 'project' });
    } else if (role < Role.DEVELOPER) {
      logger.error(`newLabel: user ${context.user.id} has insufficient privileges.`);
      throw new Forbidden();
    } else if (!args.input.name) {
      logger.error(`newLabel: missing field 'name'.`);
      throw new ResolverError(ErrorKind.MISSING_FIELD, { field: 'name' });
    } else if (!args.input.color) {
      logger.error(`newLabel: missing field 'color'.`);
      throw new ResolverError(ErrorKind.MISSING_FIELD, { field: 'color' });
    }

    // Increment the label id counter.
    const resp: any = await r.table('projects').get(project.id).update({
      labelIdCounter: r.row('labelIdCounter').add(1),
    }, {
      returnChanges: true,
    }).run(context.conn);

    const now = new Date();
    const record = {
      id: [args.project, resp.changes[0].new_val.labelIdCounter],
      name: args.input.name,
      color: args.input.color,
      creator: context.user.id,
      created: now,
      updated: now,
    };

    return r.table('labels').insert(record, { returnChanges: true })
    .run(context.conn).then(result => {
      const nl: LabelRecord = (result as any).changes[0].new_val;
      logger.info('Created label', nl.name, nl.id);
      return nl;
    }, error => {
      logger.error('Error creating project', error);
      throw new InternalError();
    });
  },

  async updateLabel(
      _: any,
      args: { project: string, id: number, input: LabelInput },
      context: Context): Promise<number> {
    if (!context.user) {
      throw new Unauthorized();
    }

    const { project, role } = await getProjectAndRole(context, args.project, undefined, true);
    if (project === null || (!project.isPublic && role < Role.VIEWER)) {
      throw new NotFound({ notFound: 'project' });
    } else if (role < Role.DEVELOPER) {
      throw new Forbidden();
    } else if (!args.input.name || !args.input.color) {
      throw new ResolverError(ErrorKind.MISSING_FIELD);
    }

    const record: Partial<LabelRecord> = {
      updated: new Date(),
    };
    if (args.input.name) {
      record.name = args.input.name;
    }
    if (args.input.color) {
      record.color = args.input.color;
    }

    const resp = await r.table('labels')
      .get([args.project, args.id] as any)
      .update(record, { returnChanges: true })
      .run(context.conn);
    if (resp.replaced === 1) {
      return (resp as any).changes[0].new_val;
    } else {
      logger.error('Error updating non-existent label', args.id, args.project, context.user);
      throw new NotFound({ notFound: 'label' });
    }
  },

  async deleteLabel(_: any, args: { project: string, id: number }, context: Context):
      Promise<number> {
    if (!context.user) {
      throw new Unauthorized();
    }
    const { project, role } = await getProjectAndRole(context, args.project, undefined, true);
    if (project === null || (!project.isPublic && role < Role.VIEWER)) {
      throw new NotFound({ notFound: 'project' });
    } else if (role < Role.DEVELOPER) {
      throw new Forbidden();
    }

    // Delete all instances of that label from issues
    await r.table('issues').filter({ project: project.id }).update({
      labels: (r.row('labels') as any).filter((id: number) => id !== args.id),
    }).run(context.conn);

    // Delete all instances of that label from project prefs
    await r.table('projectPrefs').filter({ project: project.id }).update({
      labels: (r.row('labels') as any).filter((id: number) => id !== args.id),
    }).run(context.conn);

    // Delete the label record
    const resp = await r.table('labels')
        .get([args.project, args.id] as any)
        .delete()
        .run(context.conn);
    if (resp.deleted !== 1) {
      throw new NotFound({ notFound: 'label' });
    }

    // Return the id of the deleted label
    return args.id;
  },
};

export const types = {
  Label: {
    id(label: LabelRecord) { return label.id[1]; },
    project(label: LabelRecord) { return label.id[0]; },
  },
};
