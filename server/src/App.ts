import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as express from 'express';
import { graphqlExpress } from 'graphql-server-express';
import * as http from 'http';
import * as passport from 'passport';
import * as path from 'path';
import * as r from 'rethinkdb';
import * as url from 'url';
import auth from './actions/auth';
import files from './actions/files';
import Context from './context/Context';
import { ensureDbsExist, ensureIndicesExist, ensureTablesExist } from './db/helpers';
import { logger } from './logger';
import schema from './schema';

export default class App {
  public httpServer: http.Server;
  public express: express.Application;
  public apiRouter: express.Router;
  public ready: Promise<void>;
  public logErrors: boolean;
  private conn: r.Connection;

  constructor() {
    this.logErrors = true;
    this.express = express();
    this.ready = this.init(); // Asynchronous initialization.
  }

  public start() {
    return this.ready.then(() => {
      const port = parseInt(process.env.SERVER_PORT, 10) || 80;
      logger.info(`Listening on port: ${port}.`);
      this.httpServer = this.express.listen(port);
    });
  }

  public stop() {
    this.httpServer.close();
  }

  private async init() {
    const dbUrl = url.parse(process.env.RETHINKDB_URL);
    logger.info(`Connecting to RethinkDB at host: ${dbUrl.hostname}, port: ${dbUrl.port}`);
    this.conn = await r.connect({
      host: dbUrl.hostname,
      port: parseInt(dbUrl.port, 10),
    });
    await ensureDbsExist(this.conn, [process.env.DB_NAME]);
    await ensureTablesExist(this.conn, process.env.DB_NAME, [
      'issues',
      'issueChanges',
      'issueLinks',
      'labels',
      'memberships',
      'projects',
      'projectPrefs',
      'templates',
      'users',
      'workflows',
    ]);
    await ensureIndicesExist(this.conn, process.env.DB_NAME, {
      projects: ['name'],
      memberships: ['project', 'user'],
    });
    this.conn.use(process.env.DB_NAME);
    this.middleware();
    await this.routes();
  }

  /** Install needed middleware. */
  private middleware(): void {
    this.express.use(bodyParser.json());
    this.express.use(compression());

    // Initialize passport.
    this.express.use(passport.initialize());
  }

  private async routes() {
    // Static files
    this.express.use('/fonts', express.static(path.join(__dirname, '../client/media/fonts')));
    this.express.use('/favicon', express.static(path.join(__dirname, '../client/media/favicon')));
    this.express.use('/builds', express.static(path.join(__dirname, '../builds')));

    this.apiRouter = express.Router();
    this.express.use('/api', this.apiRouter);

    // Application routes
    auth(this.apiRouter, this.conn);
    await files(this.apiRouter, this.conn);

    this.apiRouter.get('/version', (req, res) => {
      res.json({ version: process.env.npm_package_version });
    });

    // Authentication middleware
    this.apiRouter.use('/graphql', passport.authenticate('jwt', { session: false }));

    // Register GraphQL middleware
    this.apiRouter.use('/graphql', graphqlExpress(req => {
      const context: Context = {
        conn: this.conn,
        user: req.user,
      };
      return {
        schema,
        context,
        formatError: (error: any) => {
          // If it's one of our resolver errors, then log it and add additional informatio to the
          // error response - specifically id and details.
          if (error.originalError && error.originalError.kind) {
            if (this.logErrors) {
              logger.error(error.originalError.kind, error.originalError.details);
            }
            return {
              ...error,
              id: error.originalError.kind,
              details: error.originalError.details,
              locations: error.locations,
            };
          } else {
            // I think this already gets logged elsewhere.
            if (this.logErrors) {
              logger.error(JSON.stringify(error, null, 2));
            }
            return {
              message: error.message,
              locations: error.locations,
              stack: error.stack,
            };
          }
        },
      };
    }));
  }
}
