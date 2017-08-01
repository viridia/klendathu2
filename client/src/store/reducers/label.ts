import { Label } from 'common/api';
import apollo from '../apollo';

const NewLabelMutation = require('../../graphql/mutations/newLabel.graphql');
const UpdateLabelMutation = require('../../graphql/mutations/updateLabel.graphql');
const DeleteLabelMutation = require('../../graphql/mutations/deleteLabel.graphql');
const LabelsQuery = require('../../graphql/queries/labels.graphql');
const LabelSearchQuery = require('../../graphql/queries/labelSearch.graphql');

export function createLabel(project: string, input: Partial<Label>) {
  return apollo.mutate<{ newLabel: Label }>({
    mutation: NewLabelMutation,
    variables: {
      project,
      input,
    },
    // refetchQueries: ['labels'],
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
    refetchQueries: ['labels', 'projectPrefsQuery', 'leftNavQuery'],
    update: (store, { data: { deleteLabel: deletedId } }) => {
      const data: { labels: Label[] } = store.readQuery({ query: LabelsQuery });
      data.labels = data.labels.filter(p => p.id !== deletedId);
      store.writeQuery({
        query: LabelsQuery,
        variables: { project },
        data,
      });

      const data2: { labels: Label[] } = store.readQuery({ query: LabelSearchQuery });
      data2.labels = data2.labels.filter(p => p.id !== deletedId);
      store.writeQuery({ query: LabelSearchQuery, data: data2 });
    },
    // updateQueries: {
    //   labelsQuery: (previousQueryResult, { mutationResult }) => {
    //     return {
    //       labels: previousQueryResult.labels.filter(
    //         l => l.id !== mutationResult.data.deleteLabel),
    //     };
    //   },
    //   labelsSearchQuery: (previousQueryResult, { mutationResult }) => {
    //     return {
    //       labels: previousQueryResult.labels.filter(
    //         l => l.id !== mutationResult.data.deleteLabel),
    //     };
    //   },
    // },
  });
}
