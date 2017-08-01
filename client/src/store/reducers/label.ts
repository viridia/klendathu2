import { Label } from 'common/api';
import apollo from '../apollo';

const NewLabelMutation = require('../../graphql/mutations/newLabel.graphql');
const UpdateLabelMutation = require('../../graphql/mutations/updateLabel.graphql');
const DeleteLabelMutation = require('../../graphql/mutations/deleteLabel.graphql');

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
