import * as r from 'rethinkdb';
import { Role } from '../../../common/api';
import Context from '../context/Context';
import { optional } from '../db/helpers';
import MembershipRecord from '../db/types/MembershipRecord';
import {
  ErrorKind,
  Forbidden,
  NotFound,
  ResolverError,
  Unauthorized,
} from '../errors';
import { getProjectAndRole } from './role';

export const queries = {
  projectMembership(_: any, args: { project: string, user: string }, context: Context):
      Promise<MembershipRecord | null> {
    // TODO: who can view? Project members, and everyone if it's public.
    return r.table('memberships')
        .filter({ project: args.project, user: args.user || context.user.id })
        .run(context.conn)
        .then(optional<MembershipRecord>());
  },

  projectMemberships(_: any, args: { project: string }, context: Context):
      Promise<MembershipRecord[]> {
    // TODO: who can view? Project members, and everyone if it's public.
    return r.table('memberships')
        .filter({ project: args.project })
        .orderBy(r.asc('user'))
        .run(context.conn)
        .then(cursor => cursor.toArray());
  },
};

export const mutations = {
  async setProjectRole(
      _: any,
      args: { project: string, user: string, role: Role },
      context: Context): Promise<MembershipRecord> {
    if (!context.user) {
      return Promise.reject(new Unauthorized());
    }
    const isSelf = args.user === context.user.id;
    const { project, role } = await getProjectAndRole(context, args.project, undefined, true);
    if (!project || (!project.isPublic && role < Role.VIEWER)) {
      return Promise.reject(new NotFound({ notFound: 'project' }));
    } else if (role < Role.VIEWER || (role < Role.MANAGER && !isSelf)) {
      // Current user must be a member of the project to update their own membership.
      // Must be a manager to update someone else's membership.
      return Promise.reject(new Forbidden());
    }

    // Make sure it's an actual user
    if (!isSelf) {
      const existingUser = await r.table('users').get(args.user).run(context.conn);
      if (!existingUser) {
        return Promise.reject(new NotFound({ notFound: 'user' }));
      }
    }

    // Find the current role for the user we're modifying.
    const pm = await r.table('memberships')
        .filter({ project: args.project, user: args.user })
        .run(context.conn)
        .then(optional<MembershipRecord>());

    // Can't affect roles that are greater than your own role - either the existing or new role.
    if (role < args.role || (pm && role < pm.role)) {
      return Promise.reject(new Forbidden());
    }

    // If role didn't change, then simpy return the existing membership without touching the db.
    if (pm && pm.role === args.role) {
      return pm;
    }

    // Make sure there is always at least one admin
    if (isSelf && role === Role.ADMINISTRATOR) {
      const admins = await r.table('memberships')
          .filter({ project: args.project, role: Role.ADMINISTRATOR })
          .run(context.conn)
          .then(cursor => cursor.toArray());
      if (admins.length < 2) {
        throw new ResolverError(ErrorKind.NO_ADMINS);
      }
    }

    // Means we're removing this member from the project.
    if (args.role === Role.NONE) {
      await r.table('memberships')
        .filter({ project: args.project, user: args.user })
        .delete()
        .run(context.conn);
      return { ...pm, role: Role.NONE };
    }

    const now = new Date();
    if (!pm) {
      // Create new membership
      const result = await r.table('memberships').insert({
        user: args.user,
        project: args.project,
        role: args.role,
        created: now,
        updated: now,
      }, { returnChanges: true }).run(context.conn);
      return (result as any).changes[0].new_val;
    } else {
      // Update existing membership
      const result = await r.table('memberships')
        .filter({ project: args.project, user: args.user })
        .update({
          role: args.role,
          updated: now,
        }, { returnChanges: true })
        .run(context.conn);
      return (result as any).changes[0].new_val;
    }
  },
};
