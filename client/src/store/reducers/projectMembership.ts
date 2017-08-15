import { Membership, Role } from 'common/api';
import apollo from '../apollo';

import * as SetProjectRoleMutation from '../../graphql/mutations/setProjectRole.graphql';

export function setProjectRole(project: string, user: string, role: Role) {
  return apollo.mutate<{ setProjectRole: Membership }>({
    mutation: SetProjectRoleMutation,
    variables: { project, user, role },
    refetchQueries: [
      'issueListQuery', 'labelsQuery', 'projectMembershipQuery',
    ],
  });
}
