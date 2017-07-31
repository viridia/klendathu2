import { ensure } from 'certainty';
// import * as r from 'rethinkdb';
import * as request from 'supertest';
import { clearTables, createApp, createTestAccount, createTestProject } from './fixtures';

const newLabelMutation = `mutation NewLlabel($project: ID!, $input: LabelInput!) {
  newLabel(project: $project, input: $input) {
    id
    project
    name
    color
    creator
    created
    updated
  }
}`;

const labelQuery = `query Label($project: ID!, $id: Int!) {
  label(project: $project, id: $id) {
    id
    project
    name
    color
    creator
    created
    updated
  }
}`;

const labelsQuery = `query Labels($project: ID!, $token: String) {
  labels(project: $project, token: $token) {
    id
    project
    name
    color
    creator
    created
    updated
  }
}`;

describe('Labels', function () {
  this.slow(400);

  before(createApp);
  before(clearTables('users', 'projects', 'labels', 'issues', 'memberships'));
  before(createTestAccount);
  before(createTestProject);

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
    it('newLabel', function () {
      return request(this.app.httpServer)
        .post('/api/graphql')
        .set('authorization', `JWT ${this.token}`)
        .send({
          query: newLabelMutation,
          variables: {
            project: this.project.id,
            input: {
              name: 'test-label',
              color: '#ff0000',
            },
          },
        })
        .expect(200)
        .then(resp => {
          ensure(resp.body.data.newLabel).exists();
          ensure(resp.body.data.newLabel.id).equals(1);
          ensure(resp.body.data.newLabel.project).equals(this.project.id);
          ensure(resp.body.data.newLabel.name).equals('test-label');
          ensure(resp.body.data.newLabel.color).equals('#ff0000');
          ensure(resp.body.data.newLabel.creator).equals('test-user');
          ensure(resp.body.data.newLabel.created).hasType('string');
        });
    });

    it('newLabel (2)', async function () {
      let labelIndex: number;
      await request(this.app.httpServer)
        .post('/api/graphql')
        .set('authorization', `JWT ${this.token}`)
        .send({
          query: newLabelMutation,
          variables: {
            project: this.project.id,
            input: {
              name: 'test-label',
              color: '#ff0000',
            },
          },
        })
        .expect(200)
        .then(resp => {
          labelIndex = resp.body.data.newLabel.id;
        });

      await request(this.app.httpServer)
        .post('/api/graphql')
        .set('authorization', `JWT ${this.token}`)
        .send({
          query: newLabelMutation,
          variables: {
            project: this.project.id,
            input: {
              name: 'test-label-2',
              color: '#ff00ff',
            },
          },
        })
        .expect(200)
        .then(resp => {
          ensure(resp.body.data.newLabel).exists();
          ensure(resp.body.data.newLabel.id).equals(labelIndex + 1);
          ensure(resp.body.data.newLabel.name).equals('test-label-2');
          ensure(resp.body.data.newLabel.color).equals('#ff00ff');
          ensure(resp.body.data.newLabel.creator).equals('test-user');
        });
    });
  });

  describe('query', function () {
    let labelIndex: number;

    before(clearTables('labels'));
    before(function () {
      return request(this.app.httpServer)
        .post('/api/graphql')
        .set('authorization', `JWT ${this.token}`)
        .send({
          query: newLabelMutation,
          variables: {
            project: this.project.id,
            input: {
              name: 'test-label-3',
              color: '#ffff00',
            },
          },
        })
        .expect(200)
        .then(resp => {
          // console.log(resp.body.data.newLabel);
          labelIndex = resp.body.data.newLabel.id;
        });
    });

    it('label', function () {
      return request(this.app.httpServer)
        .post('/api/graphql')
        .set('authorization', `JWT ${this.token}`)
        .send({
          query: labelQuery,
          variables: {
            project: this.project.id,
            id: labelIndex,
          },
        })
        .expect(200)
        .then(resp => {
          ensure(resp.body.data.label).exists();
          ensure(resp.body.data.label.id).equals(labelIndex);
          ensure(resp.body.data.label.name).equals('test-label-3');
          ensure(resp.body.data.label.color).equals('#ffff00');
          ensure(resp.body.data.label.creator).equals('test-user');
        });
    });

    it('label (non-existent)', function () {
      return request(this.app.httpServer)
        .post('/api/graphql')
        .set('authorization', `JWT ${this.token}`)
        .send({
          query: labelQuery,
          variables: {
            project: this.project.id,
            id: 0,
          },
        })
        .expect(200)
        .then(resp => {
          ensure(resp.body.data.label).isNullOrUndefined();
        });
    });

    it('labels', function () {
      return request(this.app.httpServer)
        .post('/api/graphql')
        .set('authorization', `JWT ${this.token}`)
        .send({
          query: labelsQuery,
          variables: {
            project: this.project.id,
          },
        })
        .expect(200)
        .then(resp => {
          ensure(resp.body.data.labels).exists();
          ensure(resp.body.data.labels).hasLength(1);
          ensure(resp.body.data.labels[0].id).equals(labelIndex);
          ensure(resp.body.data.labels[0].name).equals('test-label-3');
          ensure(resp.body.data.labels[0].color).equals('#ffff00');
          ensure(resp.body.data.labels[0].creator).equals('test-user');
        });
    });
  });
});
