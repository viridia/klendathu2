import { Label } from './Label';

// const labelType = require('./labelType');

/** One of the user's saved filters. */
export interface SavedFilter {
  /** Name of this filter. */
  name: string;

  /** JSON-encoded filter expression. */
  value: string;
}

/** Stores the project-specific settings for a user: role, prefs, etc. */
export interface ProjectMembership {
  /** User name of project member. */
  user: string;

  /** Access level for the this user (direct as project member). */
  role: number;

  /** Access level for the this user (indirect as organization member). */
  inheritedRole: number;

  /** List of columns to display in the issue list. */
  columns?: string[];

  /** List of label names to display in the issue summary list. */
  labels?: number[];

  /** List of labels to display in the issue summary list. */
  labelsData: Label[];

//     resolve(pm, args, context, options) {
//       if (!pm.labels || pm.labels.length === 0) {
//         return [];
//       }
//       return options.rootValue.labelsById({ project: pm.project, idList: pm.labels });
//     },

  /** List of saved queries. */
  filters: SavedFilter[];

//     resolve(pm) {
//       const result = [];
//       if (pm.filters !== undefined) {
//         Object.keys(pm.filters).forEach(name => {
//           result.push({ name, value: pm.filters[name] });
//         });
//       }
//       return result;
//     },
}
