import * as session from 'express-session';
import * as rethinkdb from 'rethinkdb';
import { logger } from '../logger';

interface StoreOptions {
  connection: rethinkdb.Connection;
  database: string;
  table?: string;
  flushInterval?: number;
  sessionTimeout?: number;
}

const r = rethinkdb;

/** Session store for RethinkDB. */
export default class RDBStore extends session.Store {
  constructor(options: StoreOptions) {
    super();
    const conn = options.connection;
    const database = options.database;
    const table = options.table || 'sessions';
    const sessionTimeout = options.sessionTimeout || 86400000; // 1 day

    if (!conn) {
      throw Error('Invalid `connection` options specified.');
    }
    if (!database) {
      throw Error('Invalid `database` options specified.');
    }

    const db = r.db(database);
    db.tableCreate(table).run(conn, (err, res) => {
      if (err) {
        logger.verbose(`Table '${table}' already exists, skipping session table creation.`);
      }

      setInterval(() => {
        const now = new Date().getTime();
        db.table(table).filter(r.row('expires').lt(now)).delete().run(conn).then(res2 => {
          logger.verbose('Expired sessions cleared');
        }).catch(err2 => {
          logger.error('Error clearing expired session rows: ', err2);
        });
      }, options.flushInterval || 60000);
    });

    this.get = (sid: string, callback: (err: any, session?: Express.Session) => void) => {
      db.table(table).get(sid).run(conn).then(data => {
        logger.verbose(`Fetched session data for session ${sid}.`);
        callback(null, data ? (data as any).session : null);
      }).catch(err => {
        callback(err);
      });
    };

    this.set = (sid: string, s: Express.Session, callback: (err?: any) => void) => {
      const sessionToStore = {
        id: sid,
        expires: new Date().getTime() + (s.cookie.originalMaxAge || sessionTimeout),
        session: s,
      };

      db.table(table).insert(sessionToStore, { conflict: 'replace' }).run(conn)
      .then(data => {
        logger.verbose(`Set session data for session ${sid}.`);
        if (typeof callback === 'function') {
          callback();
        }
      }).catch(err => {
        callback(err);
      });
    };

    this.destroy = (sid: string, callback: (err?: any) => void) => {
      db.table(table).get(sid).delete().run(conn).then(data => {
        logger.verbose(`Deleted session data for session ${sid}.`);
        if (typeof callback === 'function') {
          callback();
        }
      }).catch(err => {
        callback(err);
      });
    };
  }
}
