import * as r from 'rethinkdb';
import Context from '../context/Context';
import { escapeRegExp } from '../db/helpers';
import { UserRecord } from '../db/types';

// User profile query
export const queries = {
  user(_: any, args: { username: string }, context: Context): Promise<UserRecord> {
    return r.table('users').get(args.username).run(context.conn).then((user: any) => {
      return user;
    });
  },

  users(_: any, args: { token: string, project?: string }, context: Context):
      Promise<UserRecord[]> {
    // TODO: get project role?
    // Can you list members of a non-public project that you are not a member of?
    // Probably not I guess...
    if (!context.user) {
      return null;
    }
    let query: r.Sequence = r.table('users');
    if (args.token) {
      const pattern = `(?i)\\b${escapeRegExp(args.token)}`;
      query = query.filter((user: any) => {
        return user('fullname').match(pattern) || user('id').match(pattern);
      });
    }
    return query.orderBy(r.asc('fullname')).run(context.conn).then(cursor => cursor.toArray());
  },
};

export const types = {
  User: {
    username(user: UserRecord) { return user.id; },
  },
};
