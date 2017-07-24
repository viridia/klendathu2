import * as r from 'rethinkdb';
import { Role } from '../../../common/api';
import Context from '../context/Context';
import { maybe } from '../db/helpers';
import ProjectMembershipRecord from '../db/types/ProjectMembershipRecord';
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

export interface ProjectAndRole {
  project?: ProjectRecord;
  role: Role;
}

/** Look up a single project and return a promise that resolves to both the project and the
    current user's role.
*/
export function getProjectAndRole(
    context: Context,
    id: string,
    name: string,
    mutation = false): Promise<ProjectAndRole> {
  // If this is a mutation and the user is not logged in, then don't even bother doing a
  // database lookup for the project, since they won't be able to do anything.
  if (mutation && !context.user) {
    return Promise.resolve({ role: Role.NONE });
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
  return r.table('projects').filter(query).run(context.conn)
  .then(maybe)
  .then((project: ProjectRecord) => {
    // No such project
    if (project === null) {
      return { role: Role.NONE };
    }

    // We're the owner
    if (context.user && context.user.id === project.owningUser) {
      return { project, role: Role.OWNER };
    }

    // Not logged in
    if (!context.user) {
      if (project.isPublic) {
        return { project, role: Role.NONE };
      } else {
        return { role: Role.NONE };
      }
    }

    // Check memberships
    return r.table('projectMemberships').filter({
      user: context.user.id,
      project: project.id,
    }).run(context.conn)
    .then(maybe)
    .then((membership: ProjectMembershipRecord): ProjectAndRole => {
      if (!membership) {
        // TODO: Return null for project if it's private and user is not a member.
        return { project, role: Role.NONE };
      }
      return { project, role: membership.role as Role };
    });
  });
}
