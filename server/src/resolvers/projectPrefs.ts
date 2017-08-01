import * as r from 'rethinkdb';
import Context from '../context/Context';
import { optional } from '../db/helpers';
import { LabelRecord, ProjectPrefsRecord } from '../db/types';
import {
  NotFound,
  Unauthorized,
} from '../errors';
import { getProjectAndRole } from './role';

export const queries = {
  projectPrefs(_: any, args: { project: string }, context: Context):
      Promise<ProjectPrefsRecord> {
    return r.table('projectPrefs')
        .filter({ project: args.project, user: context.user.id })
        .run(context.conn)
        .then(optional<ProjectPrefsRecord>())
        .then(prefs => {
          return prefs || {
            user: context.user.id,
            project: args.project,
          };
        });
  },
};

export const mutations = {
  // Note: none of these functions check role because all project prefs are personal and
  // anyone is allowed to have them.
  async setProjectPrefs(
      _: any,
      args: {
        project: string,
        labels?: number[],
        labelsToAdd?: number[],
        labelsToRemove?: number[],
        columns?: string[],
      },
      context: Context): Promise<ProjectPrefsRecord> {
    if (!context.user) {
      return Promise.reject(new Unauthorized());
    }
    const { project } = await getProjectAndRole(context, args.project, undefined, true);
    if (!project) {
      return Promise.reject(new NotFound({ notFound: 'project' }));
    }

    const prefs = await r.table('projectPrefs')
        .filter({ project: args.project, user: context.user.id })
        .run(context.conn)
        .then(optional<ProjectPrefsRecord>());

    if (!prefs) {
      // Create new prefs
      const result = await r.table('projectPrefs').insert({
        user: context.user.id,
        project: args.project,
        labels: args.labels || args.labelsToAdd || [],
        columns: args.columns || [],
      }, { returnChanges: true }).run(context.conn);
      return (result as any).changes[0].new_val;
    } else {
      const update: any = {};

      if (Array.isArray(args.labels)) {
        update.labels = args.labels;
      } else if (args.labelsToAdd || args.labelsToRemove) {
        update.labels = (r.row('labels') as any)
            .setUnion(args.labelsToAdd || [])
            .setDifference(args.labelsToRemove || []);
      }

      if (Array.isArray(args.columns)) {
        update.columns = args.columns;
      }

      // Update existing prefs
      const result = await r.table('projectPrefs')
        .filter({ project: args.project, user: context.user.id })
        .update(update, { returnChanges: true })
        .run(context.conn);
      return (result as any).changes[0].new_val;
    }
  },

  // # Project preferences: add a saved filter
  // addFilter(project: ID!, user: ID!, name: String!, value: String!): ProjectPrefs
  //
  // # Project preferences: remove a saved filter
  // removeFilter(project: ID!, user: ID!, name: String!): ProjectPrefs
};

export const types = {
  ProjectPrefs: {
    labels: (prefs: ProjectPrefsRecord, _: any, context: Context) => {
      return prefs.labels ? prefs.labels : [];
    },
    labelProps: (
        prefs: ProjectPrefsRecord,
        _: any,
        context: Context): Promise<LabelRecord[]> | LabelRecord[] => {
      if (!prefs.labels) {
        return [];
      }
      return r.table('labels')
          .getAll(...prefs.labels.map(l => [prefs.project, l]) as any)
          .orderBy(r.asc('name'))
          .run(context.conn)
          .then(cursor => cursor.toArray());
    },
    filters: (prefs: ProjectPrefsRecord, _: any, context: Context) => {
      return prefs.filters ? prefs.filters : [];
    },
    columns: (prefs: ProjectPrefsRecord, _: any, context: Context) => {
      return prefs.columns ? prefs.columns : [];
    },
  },
};
