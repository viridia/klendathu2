import * as date from './date';
import * as issue from './issue';
import * as label from './label';
import * as membership from './membership';
import * as profile from './profile';
import * as project from './project';
import * as projectPrefs from './projectPrefs';
import * as template from './template';
import * as user from './user';
import * as workflow from './workflow';

/** Root resolver map. Because the map is large, we've split it over many source files and then
    combined them into a single data structure here.
*/
export const resolverMap = {
  Query: {
    ...issue.queries,
    ...label.queries,
    ...membership.queries,
    ...profile.queries,
    ...project.queries,
    ...projectPrefs.queries,
    ...template.queries,
    ...user.queries,
    ...workflow.queries,
  },

  // // Merge definitions for all mutation resolvers
  Mutation: {
    ...label.mutations,
    ...membership.mutations,
    ...project.mutations,
    ...projectPrefs.mutations,
  },

  // Merge definitions for all subscription resolvers
  // Subscription: {
  //   ...atom.subscriptions,
  // },

  // Merge definitions for all type resolvers
  ...date.types,
  ...label.types,
  ...profile.types,
  ...project.types,
  ...projectPrefs.types,
  ...user.types,
};
