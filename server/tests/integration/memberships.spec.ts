import { ensure } from 'certainty';
import * as request from 'supertest';
import { Role } from '../../../common/api';
import {
  clearTables, createApp, createSecondUser, createTestAccount, createTestProject,
  suppressErrorLog,
} from './fixtures';

const projectMembershipQuery = `query ProjectMembership($project: ID!, $user: ID!) {
  projectMembership(project: $project, user: $user) {
    project
    user
    role
    created
    updated
  }
}`;

const projectMembershipsQuery = `query ProjectMemberships($project: ID!) {
  projectMemberships(project: $project) {
    project
    user
    role
    created
    updated
  }
}`;

const setProjectRoleMutation = `mutation SetRoleMutation($project: ID!, $user: ID!, $role: Int!) {
  setProjectRole(project: $project, user: $user, role: $role) {
    project
    user
    role
    created
    updated
  }
}`;

describe('Memberships', function () {
  this.slow(400);

  before(createApp);
  before(clearTables('users', 'projects', 'labels', 'issues', 'memberships'));
  before(createTestAccount);
  before(createSecondUser);

  after(function () {
    this.app.stop();
  });

  beforeEach(function () {
    this.consoleError = console.error;
    this.app.logErrors = true;
  });

  afterEach(function () {
    console.error = this.consoleError;
  });

  describe('mutation', function () {
    beforeEach(clearTables('projects', 'labels', 'issues', 'memberships'));
    beforeEach(createTestProject);

    it('setProjectRole', function () {
      return request(this.app.httpServer)
        .post('/api/graphql')
        .set('authorization', `JWT ${this.token}`)
        .send({
          query: setProjectRoleMutation,
          variables: {
            project: this.project.id,
            user: 'test-user-2',
            role: Role.DEVELOPER,
          },
        })
        .expect(200)
        .then(resp => {
          ensure(resp.body.data.setProjectRole).exists();
          ensure(resp.body.data.setProjectRole.project).equals(this.project.id);
          ensure(resp.body.data.setProjectRole.user).equals('test-user-2');
          ensure(resp.body.data.setProjectRole.role).equals(Role.DEVELOPER);
        });
    });

    it('setProjectRole (demote-last-admin)', function () {
      suppressErrorLog(this);
      return request(this.app.httpServer)
        .post('/api/graphql')
        .set('authorization', `JWT ${this.token}`)
        .send({
          query: setProjectRoleMutation,
          variables: {
            project: this.project.id,
            user: 'test-user',
            role: Role.DEVELOPER,
          },
        })
        .expect(200)
        .then(resp => {
          ensure(resp.body.errors).hasLength(1);
          ensure(resp.body.errors[0].id).equals('no-admins');
        });
    });

    it('setProjectRole (invalid-user)', function () {
      suppressErrorLog(this);
      return request(this.app.httpServer)
        .post('/api/graphql')
        .set('authorization', `JWT ${this.token}`)
        .send({
          query: setProjectRoleMutation,
          variables: {
            project: this.project.id,
            user: 'test-user-3',
            role: Role.DEVELOPER,
          },
        })
        .expect(200)
        .then(resp => {
          ensure(resp.body.errors).hasLength(1);
          ensure(resp.body.errors[0].id).equals('not-found');
        });
    });

    it('setProjectRole (invalid-project)', function () {
      suppressErrorLog(this);
      return request(this.app.httpServer)
        .post('/api/graphql')
        .set('authorization', `JWT ${this.token}`)
        .send({
          query: setProjectRoleMutation,
          variables: {
            project: 'invalid-project',
            user: 'test-user',
            role: Role.DEVELOPER,
          },
        })
        .expect(200)
        .then(resp => {
          ensure(resp.body.errors).hasLength(1);
          ensure(resp.body.errors[0].id).equals('not-found');
        });
    });

    it('setProjectRole (demote-self)', async function () {
      // First promote test-user-2 to admin
      await request(this.app.httpServer)
        .post('/api/graphql')
        .set('authorization', `JWT ${this.token}`)
        .send({
          query: setProjectRoleMutation,
          variables: {
            project: this.project.id,
            user: 'test-user-2',
            role: Role.ADMINISTRATOR,
          },
        })
        .expect(200);

      // Now demote us to developer
      await request(this.app.httpServer)
        .post('/api/graphql')
        .set('authorization', `JWT ${this.token}`)
        .send({
          query: setProjectRoleMutation,
          variables: {
            project: this.project.id,
            user: 'test-user',
            role: Role.DEVELOPER,
          },
        })
        .expect(200)
        .then(resp => {
          ensure(resp.body.data.setProjectRole).exists();
          ensure(resp.body.data.setProjectRole.project).equals(this.project.id);
          ensure(resp.body.data.setProjectRole.user).equals('test-user');
          ensure(resp.body.data.setProjectRole.role).equals(Role.DEVELOPER);
        });

      suppressErrorLog(this);
      // Now try to promote us again
      await request(this.app.httpServer)
        .post('/api/graphql')
        .set('authorization', `JWT ${this.token}`)
        .send({
          query: setProjectRoleMutation,
          variables: {
            project: this.project.id,
            user: 'test-user',
            role: Role.ADMINISTRATOR,
          },
        })
        .expect(200)
        .then(resp => {
          ensure(resp.body.errors).hasLength(1);
          ensure(resp.body.errors[0].id).equals('forbidden');
        });

      // Try to demote test-user 2
      await request(this.app.httpServer)
        .post('/api/graphql')
        .set('authorization', `JWT ${this.token}`)
        .send({
          query: setProjectRoleMutation,
          variables: {
            project: this.project.id,
            user: 'test-user-2',
            role: Role.VIEWER,
          },
        })
        .expect(200)
        .then(resp => {
          ensure(resp.body.errors).hasLength(1);
          ensure(resp.body.errors[0].id).equals('forbidden');
        });

      // Make sure query returns what we expected
      await request(this.app.httpServer)
        .post('/api/graphql')
        .set('authorization', `JWT ${this.token}`)
        .send({
          query: projectMembershipsQuery,
          variables: {
            project: this.project.id,
          },
        })
        .expect(200)
        .then(resp => {
          ensure(resp.body.data.projectMemberships).exists();
          ensure(resp.body.data.projectMemberships).hasLength(2);
          ensure(resp.body.data.projectMemberships[0].project).equals(this.project.id);
          ensure(resp.body.data.projectMemberships[0].user).equals('test-user');
          ensure(resp.body.data.projectMemberships[0].role).equals(Role.DEVELOPER);
          ensure(resp.body.data.projectMemberships[1].project).equals(this.project.id);
          ensure(resp.body.data.projectMemberships[1].user).equals('test-user-2');
          ensure(resp.body.data.projectMemberships[1].role).equals(Role.ADMINISTRATOR);
        });
    });

    it('setProjectRole (leave-project)', async function () {
      // First promote test-user-2 to admin
      await request(this.app.httpServer)
        .post('/api/graphql')
        .set('authorization', `JWT ${this.token}`)
        .send({
          query: setProjectRoleMutation,
          variables: {
            project: this.project.id,
            user: 'test-user-2',
            role: Role.ADMINISTRATOR,
          },
        })
        .expect(200);

      // Now demote us to developer
      await request(this.app.httpServer)
        .post('/api/graphql')
        .set('authorization', `JWT ${this.token}`)
        .send({
          query: setProjectRoleMutation,
          variables: {
            project: this.project.id,
            user: 'test-user',
            role: Role.NONE,
          },
        })
        .expect(200)
        .then(resp => {
          ensure(resp.body.data.setProjectRole).exists();
          ensure(resp.body.data.setProjectRole.project).equals(this.project.id);
          ensure(resp.body.data.setProjectRole.user).equals('test-user');
          ensure(resp.body.data.setProjectRole.role).equals(Role.NONE);
        });

      // Make sure query returns what we expected
      await request(this.app.httpServer)
        .post('/api/graphql')
        .set('authorization', `JWT ${this.token}`)
        .send({
          query: projectMembershipsQuery,
          variables: {
            project: this.project.id,
          },
        })
        .expect(200)
        .then(resp => {
          ensure(resp.body.data.projectMemberships).exists();
          ensure(resp.body.data.projectMemberships).hasLength(1);
          ensure(resp.body.data.projectMemberships[0].project).equals(this.project.id);
          ensure(resp.body.data.projectMemberships[0].user).equals('test-user-2');
          ensure(resp.body.data.projectMemberships[0].role).equals(Role.ADMINISTRATOR);
        });
    });
  });

  describe('query', function () {
    beforeEach(clearTables('projects', 'labels', 'issues', 'memberships'));
    beforeEach(createTestProject);

    it('projectMembership', function () {
      return request(this.app.httpServer)
        .post('/api/graphql')
        .set('authorization', `JWT ${this.token}`)
        .send({
          query: projectMembershipQuery,
          variables: {
            project: this.project.id,
            user: 'test-user',
          },
        })
        .expect(200)
        .then(resp => {
          ensure(resp.body.data.projectMembership).exists();
          ensure(resp.body.data.projectMembership.project).equals(this.project.id);
          ensure(resp.body.data.projectMembership.user).equals('test-user');
          ensure(resp.body.data.projectMembership.role).equals(Role.ADMINISTRATOR);
        });
    });

    it('projectMemberships', function () {
      return request(this.app.httpServer)
        .post('/api/graphql')
        .set('authorization', `JWT ${this.token}`)
        .send({
          query: projectMembershipsQuery,
          variables: {
            project: this.project.id,
          },
        })
        .expect(200)
        .then(resp => {
          ensure(resp.body.data.projectMemberships).exists();
          ensure(resp.body.data.projectMemberships).hasLength(1);
          ensure(resp.body.data.projectMemberships[0].project).equals(this.project.id);
          ensure(resp.body.data.projectMemberships[0].user).equals('test-user');
          ensure(resp.body.data.projectMemberships[0].role).equals(Role.ADMINISTRATOR);
        });
    });
  });
});
