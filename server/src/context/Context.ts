import * as rethinkdb from 'rethinkdb';
// import UserRecord from '../db/types/UserRecord';

export interface Token {
  id: string;
  expiration: Date;
}

interface Context {
  conn: rethinkdb.Connection;
  user: Token;
}

export default Context;
