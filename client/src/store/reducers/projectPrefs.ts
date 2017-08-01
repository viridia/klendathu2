// import { ProjectPrefs } from 'common/api';
import apollo from '../apollo';

const SetProjectPrefsMutation = require('../../graphql/mutations/setProjectPrefs.graphql');

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
    refetchQueries: ['leftNavQuery'],
  });
}
