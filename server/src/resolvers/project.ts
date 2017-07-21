import * as r from 'rethinkdb';
import { Project, Role } from '../../../common/api';
import Context from '../context/Context';
import ProjectRecord from '../db/types/ProjectRecord';
import { ErrorKind, InternalError, NotImplemented, ResolverError, Unauthorized } from '../errors';
import { logger } from '../logger';
import { getRole } from './role';

// Queries involving projects
export const queries = {
  project(_: any, args: { name: string, id: string }, context: Context): Promise<Project | null> {
    return null;
  },

  projects(_: any, args: { name?: string }, context: Context): Promise<Project[]> | Project[] {
    if (!context.user || !context.user.id) {
      return [];
    }

    return r.table('projects')
        .filter({ deleted: false, owningUser: context.user.id })
        .orderBy(r.asc('created'))
        .run(context.conn).then(cursor => cursor.toArray());

    // Get this user's list of project memberships.
    // return r.table('projectsMemberships')
    //     .filter({ user: context.user.id })
    //     .run(context.conn).then(cursor => {
    //       console.log('projects', cursor);
    //       return [];
    //     });

    // this.db.collection('projectMemberships').find({ user: this.user.id }).toArray()
    // .then(memberships => {
    //   // Query all projects for which this user is an owner or a member.
    //   const projectIdList = memberships.map(m => m.project);
    //   const query = {
    //     deleted: false,
    //     $or: [
    //       { owningUser: this.user.id },
    //       { _id: { $in: projectIdList } },
    //     ],
    //   };
    //   if (pname) {
    //     query.name = pname;
    //   }
    //   return context.db.collection('projects').find(query).sort({ created: -1 }).toArray()
    //   .then(projects => {
    //     const results = [];
    //     for (const p of projects) {
    //       // TODO: Need a specialized version of lookup role
    //       // Use memberships defined above.
    //       const role = getRole(context.db, p, context.user, memberships);
    //       results.push(serialize(p, { role }));
    //     }
    //     return results;
    //   });
    // });
  },
};

export const mutations = {
  newProject(_: any, args: { project: Project }, context: Context): Promise<ProjectRecord> {
    const { project } = args;
    if (!context.user) {
      return Promise.reject(new Unauthorized());
    }
    //   const { name, owner } = req.body;
    if (project.name.length < 6) {
      return Promise.reject(new ResolverError(ErrorKind.NAME_TOO_SHORT));
    } else if (!project.name.match(/^[a-z0-9\-]+$/)) {
      // Special characters not allowed
      return Promise.reject(new ResolverError(ErrorKind.INVALID_NAME));
    }
    const projects = r.table('projects');
    return projects.filter({ name: project.name }).run(context.conn)
    .then(cursor => cursor.toArray())
    .then(p => {
      // Check if project exists
      if (p.length > 0) {
        return Promise.reject(new ResolverError(ErrorKind.NAME_EXISTS));
      } else {
        const now = new Date();
        const newProject: ProjectRecord = {
          name: project.name,
          description: project.description || '',
          title: project.title || '',
          created: now,
          updated: now,
          issueIdCounter: 0,
          labelIdCounter: 0,
          deleted: false,
          isPublic: !!project.isPublic,
        };
        if (!project.owningUser) {
          newProject.owningUser = context.user.id;
          newProject.owningOrg = null;
        } else {
          // TODO: Make the user an administrator
          // TODO: Make sure the org exists.
          logger.error('Custom owners not supported.');
          return Promise.reject(new NotImplemented());
        }

        return projects.insert(newProject, { returnChanges: true })
        .run(context.conn).then(result => {
          const np: ProjectRecord = (result as any).changes[0].new_val;
          logger.info('Created project', project.name, np.id);
          return {
            ...np,
            role: Role.OWNER,
          };
        }, error => {
          logger.error('Error creating project', error);
          return Promise.reject(new InternalError());
        });
      }
    }, err => {
      logger.error('Database error checking for project existence', err);
      return Promise.reject(new InternalError());
    });
  },
};

export const types = {
  Project: {
    role: (project: ProjectRecord, _: any, context: Context) => {
      return getRole(project, context.user.id, []);
    },
  },
};
