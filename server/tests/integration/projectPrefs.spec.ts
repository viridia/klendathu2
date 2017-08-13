import { ensure } from 'certainty';
import {
  clearTables, createApp, createTestAccount, createTestProject, graphqlRequest,
} from './fixtures';

const projectPrefsQuery = `query ProjectPrefs($project: ID!) {
  projectPrefs(project: $project) {
    labels
    columns
    filters { name value }
  }
}`;

const setProjectPrefsMutation = `mutation SetProjectPrefs(
    $project: ID!,
    $labels: [Int!],
    $labelsToAdd: [Int!],
    $labelsToRemove: [Int!],
    $columns: [String!]) {
  setProjectPrefs(
      project: $project,
      labels: $labels,
      labelsToAdd: $labelsToAdd,
      labelsToRemove: $labelsToRemove,
      columns: $columns) {
    labels
    columns
    filters { name value }
  }
}`;

describe('ProjectPrefs', function () {
  this.slow(400);

  before(createApp);
  before(clearTables('users', 'projects', 'labels', 'issues', 'memberships'));
  before(createTestAccount);
  before(createTestProject);

  after(function () {
    this.app.stop();
  });

  beforeEach(clearTables('projectPrefs'));
  beforeEach(function () {
    this.consoleError = console.error;
    this.app.logErrors = true;
  });

  afterEach(function () {
    console.error = this.consoleError;
  });

  describe('mutation', function () {
    it('setProjectPrefs.labels', async function () {
      await graphqlRequest(setProjectPrefsMutation, {
        project: this.project.id,
        labels: [1, 2, 3],
      }).then(resp => {
        ensure(resp.body.data.setProjectPrefs).exists();
        ensure(resp.body.data.setProjectPrefs.labels).containsAllOf(1, 2, 3).inOrder();
        ensure(resp.body.data.setProjectPrefs.columns).isNull();
        ensure(resp.body.data.setProjectPrefs.filters).isDeeplyEqualTo([]);
      });

      await graphqlRequest(setProjectPrefsMutation, {
        project: this.project.id,
        labels: [11, 12, 13],
      }).then(resp => {
        ensure(resp.body.data.setProjectPrefs).exists();
        ensure(resp.body.data.setProjectPrefs.labels).containsAllOf(11, 12, 13).inOrder();
        ensure(resp.body.data.setProjectPrefs.columns).isNull();
        ensure(resp.body.data.setProjectPrefs.filters).isDeeplyEqualTo([]);
      });
    });

    it('setProjectPrefs.labelsToAdd', async function () {
      await graphqlRequest(setProjectPrefsMutation, {
        project: this.project.id,
        labelsToAdd: [11, 12, 13],
      }).then(resp => {
        ensure(resp.body.data.setProjectPrefs).exists();
        ensure(resp.body.data.setProjectPrefs.labels).containsAllOf(11, 12, 13).inOrder();
        ensure(resp.body.data.setProjectPrefs.columns).isNull();
        ensure(resp.body.data.setProjectPrefs.filters).isDeeplyEqualTo([]);
      });

      await graphqlRequest(setProjectPrefsMutation, {
        project: this.project.id,
        labelsToAdd: [1],
      }).then(resp => {
        ensure(resp.body.data.setProjectPrefs).exists();
        ensure(resp.body.data.setProjectPrefs.labels).containsAllOf(11, 12, 13, 1).inOrder();
        ensure(resp.body.data.setProjectPrefs.columns).isNull();
        ensure(resp.body.data.setProjectPrefs.filters).isDeeplyEqualTo([]);
      });
    });

    it('setProjectPrefs.labelsToRemove', async function () {
      await graphqlRequest(setProjectPrefsMutation, {
        project: this.project.id,
        labelsToAdd: [11, 12, 13],
      }).then(resp => {
        ensure(resp.body.data.setProjectPrefs).exists();
        ensure(resp.body.data.setProjectPrefs.labels).containsAllOf(11, 12, 13).inOrder();
        ensure(resp.body.data.setProjectPrefs.columns).isNull();
        ensure(resp.body.data.setProjectPrefs.filters).isDeeplyEqualTo([]);
      });

      await graphqlRequest(setProjectPrefsMutation, {
        project: this.project.id,
        labelsToRemove: [2, 12, 13],
      }).then(resp => {
        ensure(resp.body.data.setProjectPrefs).exists();
        ensure(resp.body.data.setProjectPrefs.labels).containsAllOf(11).inOrder();
        ensure(resp.body.data.setProjectPrefs.columns).isNull();
        ensure(resp.body.data.setProjectPrefs.filters).isDeeplyEqualTo([]);
      });
    });
  });

  describe('query', function () {
    it('projectPrefs', function () {
      return graphqlRequest(projectPrefsQuery, {
        project: this.project.id,
      }).then(resp => {
        ensure(resp.body.data.projectPrefs).exists();
        ensure(resp.body.data.projectPrefs.labels).isDeeplyEqualTo([]);
        ensure(resp.body.data.projectPrefs.columns).isNull();
        ensure(resp.body.data.projectPrefs.filters).isDeeplyEqualTo([]);
      });
    });
  });
});
