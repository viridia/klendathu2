import * as r from 'rethinkdb';
import { Project, Role } from '../../../common/api';
import Context from '../context/Context';
import { MembershipRecord, ProjectRecord } from '../db/types';
import {
  ErrorKind,
  Forbidden,
  InternalError,
  NotFound,
  // NotImplemented,
  ResolverError,
  Unauthorized,
} from '../errors';
import { logger } from '../logger';
import { getProjectAndRole } from './role';

// Queries involving projects
export const queries = {
  project(_: any, args: { id: string, name: string }, context: Context):
      Promise<ProjectRecord | null> {
    return getProjectAndRole(context, args.id, args.name).then(({ project, role }) => {
      return {
        ...project,
        role,
      };
    });
  },

  async projects(
      _: any,
      args: { name?: string },
      context: Context): Promise<ProjectRecord[]> {
    if (!context.user || !context.user.id) {
      return [];
    }

    return r.table('memberships')
        .hasFields('project')
        .filter({ user: context.user.id })
        .eqJoin('project', r.table('projects'))
        .orderBy(r.asc('right.created'))
        .run(context.conn)
        .then(cursor => cursor.toArray())
        .then((result: Array<{ left: MembershipRecord, right: ProjectRecord }>) => {
          return result.map(({ left, right }) => ({
            ...right,
            role: left.role,
          }));
        });
  },
};

export const mutations = {
  async newProject(_: any, args: { input: Project }, context: Context): Promise<ProjectRecord> {
    const { input } = args;
    if (!context.user) {
      throw new Unauthorized();
    }
    //   const { name, owner } = req.body;
    if (!input.name || input.name.length < 6) {
      throw new ResolverError(ErrorKind.NAME_TOO_SHORT);
    } else if (!input.name.match(/^[a-z0-9\-]+$/)) {
      // Special characters not allowed
      throw new ResolverError(ErrorKind.INVALID_NAME);
    }
    const projects = r.table('projects');
    const p = await projects.filter({ name: input.name }).run(context.conn)
        .then(cursor => cursor.toArray());

    // Check if project exists
    if (p.length > 0) {
      throw new ResolverError(ErrorKind.NAME_EXISTS);
    } else {
      const now = new Date();
      const newProject: ProjectRecord = {
        name: input.name,
        description: input.description || '',
        title: input.title || '',
        created: now,
        updated: now,
        issueIdCounter: 0,
        labelIdCounter: 0,
        deleted: false,
        isPublic: !!input.isPublic,
      };

      // Create the new project record.
      const result = await projects.insert(newProject, { returnChanges: true }).run(context.conn);
      const np: ProjectRecord = (result as any).changes[0].new_val;
      logger.info('Created project', input.name, np.id);

      // Make current user an administrator of the new project.
      await r.table('memberships').insert({
        user: context.user.id,
        project: np.id,
        role: Role.ADMINISTRATOR,
        created: now,
        updated: now,
      }).run(context.conn);

      return {
        ...np,
        role: Role.ADMINISTRATOR,
      };
    }
  },

  // Delete an existing project
  deleteProject(_: any, args: { project: string }, context: Context): Promise<string> {
    if (!context.user) {
      throw new Unauthorized();
    }
    return getProjectAndRole(context, args.project, undefined, true).then(({ project, role }) => {
      if (!project) {
        logger.error('Error updating non-existent project', args.project, this.user.id);
        throw new NotFound({ notFound: 'project' });
      } else if (role < Role.ADMINISTRATOR) {
        logger.error('Access denied updating project', args.project, this.user.id);
        throw new Forbidden();
      }
      const projectFilter = (r.row('id') as any).nth(0).eq(args.project);
      const projectFilter2 = (r.row('issue') as any).nth(0).eq(args.project);
      return Promise.all([
        r.table('issues').filter(projectFilter).delete().run(context.conn),
        r.table('labels').filter(projectFilter).delete().run(context.conn),
        r.table('issueLinks').filter({ project: args.project }).delete().run(context.conn),
        r.table('issueChanges').filter(projectFilter2).delete().run(context.conn),
        r.table('memberships').filter({ project: args.project }).delete().run(context.conn),
        r.table('projectPrefs').filter({ project: args.project }).delete().run(context.conn),
        r.table('projects').filter({ id: args.project }).delete().run(context.conn),
      ]);
    }).then(() => {
      logger.info('Deleted project:', args.project);
      return args.project;
    }, error => {
      logger.error('Error deleting project:', args.project, error);
      throw new InternalError();
    });
  },
};

export const types = {
  Project: {
    role: (project: ProjectRecord, _: any, context: Context) => {
      // TODO: pass in project memberships
      return project.role;
      // return getRole(project, context.user.id, []);
    },
  },
};
