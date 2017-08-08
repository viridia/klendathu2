import * as dotenv from 'dotenv';
import * as r from 'rethinkdb';
import * as request from 'supertest';
// import { Role } from '../../../common/api';
import App from '../../src/App';
import { IssueChangeRecord, IssueLinkRecord } from '../../src/db/types';
import { logger } from '../../src/logger';

dotenv.config();

// Quiet logging for tests
logger.level = 'warn';

let token: string;
let app: App;
const consoleErrors = console.error;

const newProjectMutation = `mutation NewProject($input: ProjectInput!) {
  newProject(input: $input) {
    id
    name
    title
    description
    created
    updated
    role
    template
    workflow
    isPublic
  }
}`;

export function createApp() {
  process.env.DB_NAME = 'klendathu_test';
  process.env.SERVER_PORT = '7171';
  app = this.app = new App();
  return this.app.start();
}

export function clearTables(...tableNames: string[]) {
  return function() {
    return Promise.all(tableNames.map(t => r.table(t).delete({}).run(this.app.conn)));
  };
}

export function clearAllTables() {
  return clearTables(
    'issues',
    'issueChanges',
    'issueLinks',
    'labels',
    'memberships',
    'users',
    'projects',
  );
}

export function clearProjects() {
  return clearTables(
    'issues',
    'issueChanges',
    'issueLinks',
    'labels',
    'memberships',
    'projects',
  );
}

export function createTestAccount() {
  return request(this.app.httpServer)
    .post('/api/signup')
    // .set('authorization', this.authHeader)
    .send({
      email: 'test@testing.org',
      username: 'test-user',
      fullname: 'Test User',
      password: 'abc123',
      password2: 'abc123',
    })
    .expect(200)
    .then(resp => {
      token = this.token = resp.body.token;
    });
}

export function createSecondUser() {
  return r.table('users').insert({
    id: 'test-user-2',
    email: 'test2@testing.org',
    fullname: 'User 2',
  }).run(this.app.conn);
}

export function createTestProject() {
  return request(this.app.httpServer)
    .post('/api/graphql')
    .set('authorization', `JWT ${this.token}`)
    .send({
      query: newProjectMutation,
      variables: {
        input: {
          name: 'test-project',
        },
      },
    })
    .expect(200)
    .then(resp => {
      this.project = resp.body.data.newProject;
      // console.log(this.project);
    });
}

interface RequestOptions {
  suppressErrorLog?: boolean;
}

export function graphqlRequest(query: string, variables: object, options: RequestOptions = {}) {
  if (options.suppressErrorLog) {
    app.logErrors = false;
    console.error = () => '';
  }
  return request(app.httpServer)
    .post('/api/graphql')
    .set('authorization', `JWT ${token}`)
    .send({
      query,
      variables,
    })
    .expect(200).then(resp => {
      if (options.suppressErrorLog) {
        app.logErrors = true;
        console.error = consoleErrors;
      }
      return resp;
    }, error => {
      if (options.suppressErrorLog) {
        app.logErrors = true;
        console.error = consoleErrors;
      }
      return Promise.reject(error);
    });
}

export function linksFrom(project: string, id: number): Promise<IssueLinkRecord[]> {
  return r.table('issueLinks')
      .filter({ project, from: id })
      .orderBy(r.asc('to'))
      .run((app as any).conn)
      .then(cursor => cursor.toArray());
}

export function changesTo(project: string, id: number): Promise<IssueChangeRecord[]> {
  return r.table('issueChanges')
      .filter({ project, issue: id })
      .orderBy(r.asc('at'))
      .run((app as any).conn)
      .then(cursor => cursor.toArray());
}
