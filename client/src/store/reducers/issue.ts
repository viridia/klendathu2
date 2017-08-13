import { IssueInput } from 'common/api';
import apollo from '../apollo';

import * as AddCommentMutation from '../../graphql/mutations/addComment.graphql';
import * as DeleteIssueMutation from '../../graphql/mutations/deleteIssue.graphql';
import * as NewIssueMutation from '../../graphql/mutations/newIssue.graphql';
import * as UpdateIssueMutation from '../../graphql/mutations/updateIssue.graphql';

export function createIssue(project: string, input: IssueInput) {
  return apollo.mutate({
    mutation: NewIssueMutation,
    variables: { project, input },
    refetchQueries: ['issueListQuery'],
  });
}

export function updateIssue(project: string, id: number, input: Partial<IssueInput>) {
  return apollo.mutate({
    mutation: UpdateIssueMutation,
    variables: { id, project, input },
    refetchQueries: ['issueListQuery', 'issueDetailsQuery'],
  });
}

export function addComment(project: string, id: number, comment: string) {
  return apollo.mutate({
    mutation: AddCommentMutation,
    variables: { id, project, comment },
  });
}

export function deleteIssue(project: string, id: number) {
  return apollo.mutate({
    mutation: DeleteIssueMutation,
    variables: { project, id },
    refetchQueries: ['issueDetailsQuery'],
    // updateQueries: {
    //   issueListQuery: (previousQueryResult, { mutationResult }) => {
    //     return {
    //       issues: previousQueryResult.issues.filter(
    //         issue => issue.id !== mutationResult.data.deleteIssue),
    //     };
    //   },
    // },
  });
}
