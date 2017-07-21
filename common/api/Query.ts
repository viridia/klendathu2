import { Issue } from './Issue';
import { Label } from './Label';
import { Project } from './Project';
import { ProjectMembership } from './ProjectMembership';

export interface Query {

  /** Retrieve a project record by id or by name.
      @param project Project containing the issue being queried.
      @param id Id of the issue to retrieve.
  */
  issue({ project, id }: { project: string, id: number }): Issue | null;

    // fields: {

    //   issues: {
    //     description: 'Retrieve issues which meet a set of filter criteria.',
    //     type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(issueType))),
    //     args: {
    //       project: {
    //         type: GraphQLID,
    //         description: 'Project containing the issues being queried.',
    //       },
    //       search: {
    //         type: GraphQLString,
    //         description: 'Text search string.',
    //       },
    //       type: {
    //         type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
    //         description: 'Query term that restricts the issue search to a set of types.',
    //       },
    //       state: {
    //         type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
    //         description: 'Query term that restricts the issue search to a set of states.',
    //       },
    //       owner: {
    //         type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
    //         description: 'Query term that restricts the issue search to a set of owners.',
    //       },
    //       reporter: {
    //         type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
    //         description: 'Query term that restricts the issue search to a set of reporters.',
    //       },
    //       cc: {
    //         type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
    //         description: 'Query term that restricts the issue search to a set of ccs.',
    //       },
    //       summary: {
    //         type: GraphQLString,
    //         description: 'Query term that searches the summary field.',
    //       },
    //       summaryPred: {
    //         type: predicateType,
    //         description: 'Search predicate for the summary field.',
    //         defaultValue: 'in',
    //       },
    //       description: {
    //         type: GraphQLString,
    //         description: 'Query term that searches the description field.',
    //       },
    //       descriptionPred: {
    //         type: predicateType,
    //         description: 'Search predicate for the description field.',
    //         defaultValue: 'in',
    //       },
    //       labels: {
    //         type: new GraphQLList(new GraphQLNonNull(GraphQLInt)),
    //         description: 'Query term that restricts the issue search to a set of label ids.',
    //       },
    //       linked: {
    //         type: new GraphQLList(new GraphQLNonNull(GraphQLInt)),
    //         description: 'Specifies a list of linked issues to search for.',
    //       },
    //       comment: {
    //         type: GraphQLString,
    //         description: 'Query term that searches the issue comments.',
    //       },
    //       commentPred: {
    //         type: predicateType,
    //         description: 'Search predicate for the comments.',
    //         defaultValue: 'in',
    //       },
    //       custom: {
    //         type: new GraphQLList(new GraphQLNonNull(customSearch)),
    //         description: 'Query term that searches custom fields.',
    //       },
    //       sort: {
    //         type: new GraphQLList(GraphQLString),
    //         description: 'Query term that specifies the field sort order.',
    //       },
    //       subtasks: {
    //         type: GraphQLBoolean,
    //         description: 'Whether to show issues hierarchically (subtasks).',
    //       },
    //     },
    //   },
    //   issueSearch: {
    //     description: 'Search for issues by text query, sorted by relevance.',
    //     type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(issueType))),
    //     args: {
    //       project: { type: GraphQLID },
    //       search: { type: GraphQLString },
    //     },
    //   },
    //   searchCustomFields: {
    //     description: 'Search custom field text, used for auto completion.',
    //     type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))),
    //     args: {
    //       project: { type: new GraphQLNonNull(GraphQLID) },
    //       field: { type: new GraphQLNonNull(GraphQLString) },
    //       search: { type: new GraphQLNonNull(GraphQLString) },
    //     },
    //   },
  /** Retrieve a project record by id or by name.
      @param id Id of the project to retrieve.
      @param name Name of the project to retreive.
  */
  project({ id, name }: { id?: string, name?: string }): Project | null;

  /** Retrieve a list of projects.
      @param name Name of the project to retreive.
  */
  projects({ name }: { name: string }): Project[];

  /** Information about a project member, including role and settings.
      @param project Identifier for the project.
      @param user Username of the user. Defaults to current user.
  */
  projectMembership({ project, user }: { project?: string, user?: string }):
      ProjectMembership | null;

  /** Information about all project members, including role and settings.
      @param project Identifier for the project.
  */
  projectMemberships({ project }: { project?: string }): ProjectMembership[];

  /** Data for a label.
      @param project Identifier for the project containing the label.
      @param id Label id.
  */
  label({ project, id }: { project: string, id: number }): Label | null;

  /** Retrieve a list of labels.
      @param project Identifier for the project containing the labels.
      @param token Label search token.
  */
  labels({ project, token }: { project: string, token?: string }): Label[];

    //   workflow: {
    //     type: workflowType,
    //     args: {
    //       project: { type: new GraphQLNonNull(GraphQLString) },
    //       name: { type: new GraphQLNonNull(GraphQLString) },
    //     },
    //   },
    //   template: {
    //     type: templateType,
    //     args: {
    //       project: { type: new GraphQLNonNull(GraphQLString) },
    //       name: { type: new GraphQLNonNull(GraphQLString) },
    //     },
    //   },
    //   profile: {
    //     description: 'Profile of the current logged-in user.',
    //     type: userType,
    //   },
    //   user: {
    //     description: 'Query information about a user.',
    //     type: userType,
    //     args: {
    //       username: { type: GraphQLString },
    //     },
    //     // This needs to be here because we already have a 'user' field on the root object.
    //     resolve(root, { username }) {
    //       return root.singleUser({ username });
    //     },
    //   },
    //   users: {
    //     description: 'Look up users matching a search token.',
    //     type: new GraphQLNonNull(new GraphQLList(userType)),
    //     args: {
    //       token: {
    //         type: GraphQLString,
    //         description: 'Search token.',
    //       },
    //     },
    //   },
    // },
}
