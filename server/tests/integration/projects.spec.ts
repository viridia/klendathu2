import { ensure } from 'certainty';
import * as dotenv from 'dotenv';
import * as request from 'supertest';
import { Role } from '../../../common/api';
import { logger } from '../../src/logger';
import { clearTables, createApp, createTestAccount } from './fixtures';

dotenv.config();

// Quiet logging for tests
logger.level = 'warn';

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

// const updateProjectMutation = `mutation UpdateProject($project: ID!, $input: ProjectInput!) {
//   newProject(project: $project, input: $input) {
//     id
//     name
//     title
//     description
//     created
//     updated
//     role
//     template
//     workflow
//     isPublic
//   }
// }`;

const deleteProjectMutation = `mutation DeleteProject($project: ID!) {
  deleteProject(project: $project)
}`;

describe('Projects', function () {
  this.slow(300);

  before(createApp);
  before(clearTables('users', 'issues', 'projects', 'memberships'));
  before(createTestAccount);

  beforeEach(function () {
    this.consoleError = console.error;
    this.app.logErrors = true;
  });

  after(function () {
    this.app.stop();
  });

  afterEach(function () {
    console.error = this.consoleError;
  });

  describe('mutation', function () {
    afterEach(clearTables('projects'));

    it('newProject', function () {
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
          ensure(resp.body.data.newProject).exists();
          ensure(resp.body.data.newProject.name).equals('test-project');
          ensure(resp.body.data.newProject.title).equals('');
          ensure(resp.body.data.newProject.isPublic).isFalse();
          // ensure(resp.body.data.newProject.owningUser).equals('test-user');
          ensure(resp.body.data.newProject.role).equals(Role.ADMINISTRATOR);
          // this.token = resp.body.token;
        });
    });

    it('newProject (duplicate name)', async function () {
      await request(this.app.httpServer)
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
        .expect(200);

      this.app.logErrors = false;
      console.error = () => '';
      await request(this.app.httpServer)
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
          ensure(resp.body.errors).exists();
          ensure(resp.body.errors[0].id).equals('name-exists');
          // this.token = resp.body.token;
        });
    });

    // it('updateProject', async function () {
    //   let projectId;
    //   await request(this.app.httpServer)
    //     .post('/api/graphql')
    //     .set('authorization', `JWT ${this.token}`)
    //     .send({
    //       query: newProjectMutation,
    //       variables: {
    //         input: {
    //           name: 'test-project',
    //           description: 'a test project',
    //         },
    //       },
    //     })
    //     .expect(200)
    //     .then(resp => {
    //       projectId = resp.body.data.newProject.id;
    //     });
    //
    //   await request(this.app.httpServer)
    //     .post('/api/graphql')
    //     .set('authorization', `JWT ${this.token}`)
    //     .send({
    //       query: updateProjectMutation,
    //       variables: {
    //         project: projectId,
    //         input: {
    //           name: 'test-project',
    //         },
    //       },
    //     })
    //     .expect(200)
    //     .then(resp => {
    //       // ensure(resp.body.errors).exists();
    //       // ensure(resp.body.errors[0].id).equals('name-exists');
    //       // this.token = resp.body.token;
    //     });
    // });

    it('deleteProject', async function () {
      let projectId: string;
      await request(this.app.httpServer)
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
          projectId = resp.body.data.newProject.id;
        });

      await request(this.app.httpServer)
        .post('/api/graphql')
        .set('authorization', `JWT ${this.token}`)
        .send({
          query: deleteProjectMutation,
          variables: {
            project: projectId,
          },
        })
        .expect(200)
        .then(resp => {
          ensure(resp.body.data.deleteProject).equals(projectId);
        });
    });
  });
});
