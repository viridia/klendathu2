// import { ensure } from 'certainty';
import * as dotenv from 'dotenv';
import * as r from 'rethinkdb';
import * as request from 'supertest';
import App from '../../src/App';
import { logger } from '../../src/logger';

dotenv.config();

// Quiet logging for tests
logger.level = 'warn';

const newProjectMutation = `mutation NewProject($input: ProjectInput!) {
  newProject(project: $input) {
    id
    name
  }
}`;

describe('Projects', function () {
//   this.slow(300);

  before(function () {
    process.env.DB_NAME = 'klendathu_test';
    process.env.SERVER_PORT = '7171';
    this.app = new App();
    return this.app.start();
  });

  before(function () {
    return r.table('users').delete({}).run(this.app.conn);
  });

  before(function () {
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
        console.log('response', resp.body);
      });
  // apiRouter.post('/signup', (req, res) => {
  //   const { email, username, fullname, password, password2 } = req.body;
  });

  beforeEach(function () {
    return Promise.all([
      r.table('issues').delete({}).run(this.app.conn),
      r.table('projects').delete({}).run(this.app.conn),
      r.table('projectMemberships').delete({}).run(this.app.conn),
    ]);
  });

  after(function () {
    this.app.stop();
  });

  it('mutation.newProject', function () {
    return request(this.app.httpServer)
      .post('/api/graphql')
      // .set('authorization', this.authHeader)
      .send({
        query: newProjectMutation,
        variables: {
          input: {},
        },
      })
      .expect(200);
  });
});
