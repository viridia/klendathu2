import * as date from './date';
import * as issue from './issue';
import * as profile from './profile';
import * as project from './project';

/** Root resolver map. Because the map is large, we've split it over many source files and then
    combined them into a single data structure here.
*/
export const resolverMap = {
  Query: {
    ...issue.queries,
    ...profile.queries,
    ...project.queries,
  },

  // // Merge definitions for all mutation resolvers
  Mutation: {
    ...project.mutations,
  },

  // Merge definitions for all subscription resolvers
  // Subscription: {
  //   ...atom.subscriptions,
  // },

  // Merge definitions for all type resolvers
  ...date.types,
  ...profile.types,
  ...project.types,
};