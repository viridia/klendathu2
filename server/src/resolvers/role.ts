import * as r from 'rethinkdb';
import { Role } from '../../../common/api';
import Context from '../context/Context';
import { optional } from '../db/helpers';
import MembershipRecord from '../db/types/MembershipRecord';
import ProjectRecord from '../db/types/ProjectRecord';

export function getRole(
    project: ProjectRecord,
    user: string,
    memberships: Array<{ project: string, role: Role }> = []): Role {
  if (!user) {
    return Role.NONE;
  } else {
    const mb = memberships.find(m => m.project === project.name);
    if (mb) {
      return mb.role;
    }
    return Role.NONE;
  }
}

export interface ProjectAndRole {
  project?: ProjectRecord;
  role: Role;
}

/** Look up a single project and return a promise that resolves to both the project and the
    current user's role.
*/
export async function getProjectAndRole(
    context: Context,
    id: string,
    name: string,
    mutation = false): Promise<ProjectAndRole> {
  // If this is a mutation and the user is not logged in, then don't even bother doing a
  // database lookup for the project, since they won't be able to do anything.
  if (mutation && !context.user) {
    return { role: Role.NONE };
  }
  const query: any = {
    deleted: false,
  };
  if (id) {
    query.id = id;
  }
  if (name) {
    query.name = name;
  }

  const project = await r.table('projects')
    .filter(query)
    .run(context.conn)
    .then(optional<ProjectRecord>());

  // No such project
  if (project === null) {
    return { role: Role.NONE };
  }

  // Not logged in
  if (!context.user) {
    if (project.isPublic) {
      // Public project, allow minimal access
      return { project, role: Role.NONE };
    } else {
      return { role: Role.NONE };
    }
  }

  // Check memberships
  // TODO: Also check owning org of project if there is one
  const membership = await r.table('memberships').filter({
      user: context.user.id,
      project: project.id,
    }).run(context.conn).then(optional<MembershipRecord>());

  if (!membership) {
    // TODO: Return null for project if it's private and user is not a member.
    return { project, role: Role.NONE };
  }
  return { project, role: membership.role as Role };
}
