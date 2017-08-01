import * as rethinkdb from 'rethinkdb';

export interface Token {
  id: string;
  expiration: Date;
}

interface Context {
  conn: rethinkdb.Connection;
  user: Token;
}

export default Context;
