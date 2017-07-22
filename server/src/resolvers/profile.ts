import * as r from 'rethinkdb';
import Context from '../context/Context';
import UserRecord from '../db/types/UserRecord';

// User profile query
export const queries = {
  profile(_: any, args: { project: string, id: number }, context: Context):
      Promise<UserRecord> | UserRecord {
    if (!context.user) {
      return null;
    }
    return r.table('users').get(context.user.id).run(context.conn).then((user: any) => {
      return { ...user, expiration: context.user.expiration };
    });
  },
};

export const types = {
  User: {
    username(user: UserRecord) { return user.id; },
  },
  Profile: {
    username(user: UserRecord) { return user.id; },
  },
};