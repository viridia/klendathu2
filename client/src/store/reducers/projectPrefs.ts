// import { ProjectPrefs } from 'common/api';
import apollo from '../apollo';

const SetProjectPrefsMutation = require('../../graphql/mutations/setProjectPrefs.graphql');
// const LeftNavDataQuery  = require('../../graphql/queries/leftNavData.graphql');
// const ProjectPrefsQuery  = require('../../graphql/queries/projectPrefs.graphql');

export function setProjectPrefs(project: string, {
    labels,
    labelsToAdd,
    labelsToRemove,
    columns,
  }: {
    labels?: number[],
    labelsToAdd?: number[],
    labelsToRemove?: number[],
    columns?: string[],
  }) {
  return apollo.mutate({
    mutation: SetProjectPrefsMutation,
    variables: { project, labels, labelsToAdd, labelsToRemove },
    // NOTE: We don't need this updater since updating by id should work.
    // update: (store, { data }: { data: { setProjectPrefs: ProjectPrefs }}) => {
    //   // const newData: {
    //   //   projectPrefs: ProjectPrefs;
    //   // } = store.readQuery({ query: LeftNavDataQuery });
    //   // newData.projectPrefs = data.setProjectPrefs;
    //   // store.writeQuery({ query: LeftNavDataQuery, data: newData });
    //
    //   // Update the project preferences query
    //   store.writeQuery({
    //     query: ProjectPrefsQuery,
    //     variables: project,
    //     data: { projectPrefs: data.setProjectPrefs } });
    // },
  });
}
