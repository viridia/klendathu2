// import * as r from 'rethinkdb';
import * as fs from 'fs';
import * as path from 'path';
import Context from '../context/Context';
import { logger } from '../logger';

export const queries = {
  template(_: any, args: { name: string }, context: Context): any {
    const parts = args.name.split('/');
    if (parts.length < 2) {
      logger.error('Invalid template name:', args.name);
      return null;
    }
    if (parts[0] === 'std') {
      if (parts.length !== 2) {
        logger.error('Invalid template name:', args.name);
        return null;
      }
      const name = parts[1];
      return new Promise((resolve, reject) => {
        const filePath = path.resolve(__dirname, `../../templates/${name}.json`);
        fs.readFile(filePath, 'utf8', (err: any, data: any) => {
          if (err) {
            logger.error('Error reading template file:', JSON.stringify(err));
            if (err.code === 'ENOENT') {
              reject(404);
            } else {
              reject(500);
            }
          } else {
            resolve(JSON.parse(data));
          }
        });
      });
    } else {
      logger.error('Can\'t locate template:', args.name);
      return null;
    }
  },
};

export const types = {
  // User: {
  //   username(user: UserRecord) { return user.id; },
  // },
};
