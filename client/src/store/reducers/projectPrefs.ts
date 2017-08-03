// import { ProjectPrefs } from 'common/api';
import SetProjectPrefsMutation from '../../graphql/mutations/setProjectPrefs.graphql';
import apollo from '../apollo';

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
