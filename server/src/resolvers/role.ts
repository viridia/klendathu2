import { Role } from '../../../common/api';
import ProjectRecord from '../db/types/ProjectRecord';

export function getRole(
    project: ProjectRecord,
    user: string,
    memberships: Array<{ project: string, role: Role }> = []): Role {
  if (!user) {
    return Role.NONE;
  } else if (project.owningUser && project.owningUser === user) {
    return Role.OWNER;
  } else {
    const mb = memberships.find(m => m.project === project.name);
    if (mb) {
      return mb.role;
    }
    return Role.NONE;
  }
}
