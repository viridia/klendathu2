import * as r from 'rethinkdb';

export function ensureDbsExist (conn: r.Connection, dbNames: string[]) {
  return r.dbList().run(conn).then(existing => {
    const promises: any[] = [];
    for (const db of dbNames) {
      if (existing.indexOf(db) < 0) {
        promises.push(r.dbCreate(db).run(conn));
      }
    }
    return Promise.all(promises);
  });
}

export function ensureTablesExist (conn: r.Connection, dbName: string, tables: string[]) {
  const db = r.db(dbName);
  return db.tableList().run(conn).then(existing => {
    const promises: any[] = [];
    for (const table of tables) {
      if (existing.indexOf(table) < 0) {
        promises.push(db.tableCreate(table).run(conn));
      }
    }
    return Promise.all(promises);
  });
}

export function ensureIndicesExist (
    conn: r.Connection,
    dbName: string,
    indices: { [key: string]: string[] }) {
  const db = r.db(dbName);
  const promises: any[] = [];
  for (const tableName of Object.getOwnPropertyNames(indices)) {
    promises.push(db.table(tableName).indexList().run(conn).then(existing => {
      const p: any[] = [];
      for (const indexName of indices[tableName]) {
        if (existing.indexOf(indexName) < 0) {
          p.push(db.table(tableName).indexCreate(indexName).run(conn));
        }
      }
      return Promise.all(p);
    }));
  }
  return Promise.all(promises);
}
