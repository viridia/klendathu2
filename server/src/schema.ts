import * as fs from 'fs';
import { makeExecutableSchema } from 'graphql-tools';
import * as path from 'path';
import { logger } from './logger';
import { resolverMap } from './resolvers';

function loadTypeDefs(baseDir: string): string[] {
  const typeDefs: string[] = [];
  fs.readdirSync(baseDir).forEach(name => {
    if (name.endsWith('.graphql')) {
      typeDefs.push(fs.readFileSync(path.resolve(baseDir, name)).toString());
    }
  });
  return typeDefs;
}

const schema = makeExecutableSchema({
  typeDefs: loadTypeDefs('common/gql'),
  resolvers: resolverMap as any,
  logger: { log(msg: string) { logger.info(msg); } },
});

export default schema;
