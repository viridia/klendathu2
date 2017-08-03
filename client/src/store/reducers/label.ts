import { Label } from 'common/api';
import apollo from '../apollo';

import NewLabelMutation from '../../graphql/mutations/newLabel.graphql';
import UpdateLabelMutation from '../../graphql/mutations/updateLabel.graphql';
import DeleteLabelMutation from '../../graphql/mutations/deleteLabel.graphql';

export function createLabel(project: string, input: Partial<Label>) {
  return apollo.mutate<{ newLabel: Label }>({
    mutation: NewLabelMutation,
    variables: {
      project,
      input,
    },
    refetchQueries: ['labelsQuery'],
  });
}

export function updateLabel(project: string, id: number, input: Partial<Label>) {
  return apollo.mutate<{ updateLabel: Label }>({
    mutation: UpdateLabelMutation,
    variables: { project, id, input },
  });
}

export function deleteLabel(project: string, id: number) {
  return apollo.mutate<{ deleteLabel: number }>({
    mutation: DeleteLabelMutation,
    variables: { project, label: id },
    refetchQueries: ['labelsQuery', 'projectPrefsQuery', 'leftNavQuery'],
  });
}
