import { ensure } from 'certainty';
import { Issue } from 'common/api';
import {
  clearAllTables, createApp, createTestAccount, createTestProject, graphqlRequest,
} from './fixtures';

const newIssueMutation = `mutation NewIssue($project: ID!, $input: IssueInput!) {
  newIssue(project: $project, input: $input) {
    project
    id
    type
    state
    summary
    description
    reporter
    owner
    cc
    created
    updated
    labels
  }
}`;
  // custom {
  //   name
  //   value
  // }
  // labelProps {
  //   id
  //   name
  //   color
  // }
  // attachmentsData {
  //   id
  //   filename
  //   url
  //   thumb
  //   type
  // }
  // comments {
  //   author
  //   body
  //   created
  // }
  // linked {
  //   relation
  //   to
  // }

const issueQuery = `query IssueQuery($project: ID!, $id: Int!) {
  issue(project: $project, id: $id) {
    project
    id
    type
    state
    summary
    description
    reporter
    owner
    cc
    created
    updated
    labels
  }
}`;

const issuesQuery = `query IssuesQuery(
    $project: ID!,
    $search: String,
    $type: [String!],
    $state: [String!],
    $owner: [String!],
    $reporter: [String!],
    $cc: [String],
    $summary: String,
    $summaryPred: Predicate,
    $description: String,
    $descriptionPred: Predicate,
    $labels: [Int!],
    $linked: [Int!],
    $comment: String,
    $commentPred: Predicate,
    $custom: [CustomSearchInput!],
    $sort: [String!],
    $subtasks: Boolean) {
  issues(
      project: $project,
      search: $search,
      type: $type,
      state: $state,
      owner: $owner,
      reporter: $reporter,
      cc: $cc,
      summary: $summary,
      summaryPred: $summaryPred,
      description: $description,
      descriptionPred: $descriptionPred,
      labels: $labels,
      linked: $linked,
      comment: $comment,
      commentPred: $commentPred,
      custom: $custom,
      sort: $sort,
      subtasks: $subtasks) {
    project
    id
    type
    state
    summary
    description
    reporter
    owner
    cc
    created
    updated
    labels
    linked {
      relation
      to
    }
  }
}`;

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

// TODO: create linked
// TODO: query linked
// TODO: create comment
// TODO: query comment
// reporter
// owner
// cc

describe('Issues', function () {
  this.slow(400);

  before(createApp);
  before(clearAllTables());
  before(createTestAccount);
  before(createTestProject);

  after(function () {
    this.app.stop();
  });

  describe('mutation', function () {
    it('newIssue', function () {
      return graphqlRequest(newIssueMutation, {
        project: this.project.id,
        input: {
          type: 'bug',
          state: 'open',
          summary: 'test-summary',
          description: 'test-description',
        },
      }).then(resp => {
        const record = resp.body.data.newIssue;
        ensure(record).exists();
        ensure(record.id).equals(1);
        ensure(record.project).equals(this.project.id);
        ensure(record.type).equals('bug');
        ensure(record.state).equals('open');
        ensure(record.summary).equals('test-summary');
        ensure(record.description).equals('test-description');
        ensure(record.reporter).equals('test-user');
        ensure(record.owner).isNull();
        ensure(record.created).matches(/\w+ \w+ \d+ \d+ \d+:\d+:\d+/);
        ensure(record.updated).matches(/\w+ \w+ \d+ \d+ \d+:\d+:\d+/);
        ensure(record.labels).hasLength(0);
      });
    });

    it('updateIssue', function () {
      //
    });
  });

  describe('query', function () {
    let labelIndex: number;
    let issue1: number;
    let issue2: number;
    let issue3: number;

    before(async function () {
      // Create a label
      await graphqlRequest(newLabelMutation, {
        project: this.project.id,
        input: {
          name: 'test-label',
          color: '#ff0000',
        },
      }).then(resp => {
        labelIndex = resp.body.data.newLabel.id;
      });

      // Create three issues
      await graphqlRequest(newIssueMutation, {
        project: this.project.id,
        input: {
          type: 'bug',
          state: 'open',
          summary: 'test-summary',
          description: 'test-description',
        },
      }).then(resp => {
        issue1 = resp.body.data.newIssue.id;
      });

      await graphqlRequest(newIssueMutation, {
        project: this.project.id,
        input: {
          type: 'feature',
          state: 'closed',
          summary: 'a random message',
          description: 'more text',
          custom: [
            { name: 'priority', value: 'P1' },
            { name: 'severity', value: 'S1' },
          ],
        },
      }).then(resp => {
        issue2 = resp.body.data.newIssue.id;
      });

      await graphqlRequest(newIssueMutation, {
        project: this.project.id,
        input: {
          type: 'task',
          state: 'open',
          summary: 'a different message',
          description: 'even more',
          owner: 'test-user',
          labels: [labelIndex],
          linked: [
            { to: issue1, relation: 'BLOCKED_BY' },
            { to: issue2, relation: 'DUPLICATE' },
          ],
        },
      }).then(resp => {
        issue3 = resp.body.data.newIssue.id;
      });
    });

    it('issue', function () {
      return graphqlRequest(issueQuery, {
        project: this.project.id,
        id: issue1,
      }).then(resp => {
        const record = resp.body.data.issue;
        ensure(record).exists();
        ensure(record.id).equals(2);
        ensure(record.project).equals(this.project.id);
        ensure(record.type).equals('bug');
        ensure(record.state).equals('open');
        ensure(record.summary).equals('test-summary');
        ensure(record.description).equals('test-description');
        ensure(record.reporter).equals('test-user');
        ensure(record.owner).isNull();
        ensure(record.created).matches(/\w+ \w+ \d+ \d+ \d+:\d+:\d+/);
        ensure(record.updated).matches(/\w+ \w+ \d+ \d+ \d+:\d+:\d+/);
        ensure(record.labels).hasLength(0);
      });
    });

    describe('issues', function () {
      it('bad-project', function () {
        return graphqlRequest(issuesQuery, {
          project: 'different-project',
        }, { suppressErrorLog: true }).then(resp => {
          ensure(resp.body.data).isNull();
        });
      });

      it('all', function () {
        return graphqlRequest(issuesQuery, {
          project: this.project.id,
        }).then(resp => {
          ensure(resp.body.data.issues).hasLength(4);
          const issues: Issue[] = resp.body.data.issues;
          ensure(issues.map(i => i.id)).containsExactly(4, 3, 2, 1).inOrder();
          ensure(new Set(issues.map(i => i.project))).containsExactly(this.project.id);
          ensure(new Set(issues.map(i => i.type))).containsExactly('bug', 'feature', 'task');
          ensure(new Set(issues.map(i => i.state))).containsExactly('open', 'closed');
          issues.reverse();
          ensure(issues[1].linked).isDeeplyEqualTo([{ relation: 'BLOCKS', to: 4 }]);
          ensure(issues[2].linked).isDeeplyEqualTo([{ relation: 'DUPLICATE', to: 4 }]);
          ensure(issues[3].linked).isDeeplyEqualTo([
            { relation: 'BLOCKED_BY', to: 2 },
            { relation: 'DUPLICATE', to: 3 },
          ]);
        });
      });

      it('type', function () {
        return graphqlRequest(issuesQuery, {
          project: this.project.id,
          type: ['task'],
        }).then(resp => {
          ensure(resp.body.data.issues).hasLength(1);
          const issues: Issue[] = resp.body.data.issues;
          ensure(issues[0].type).equals('task');
        });
      });

      it('types', function () {
        return graphqlRequest(issuesQuery, {
          project: this.project.id,
          type: ['bug', 'feature'],
        }).then(resp => {
          ensure(resp.body.data.issues).hasLength(3);
        });
      });

      it('state', function () {
        return graphqlRequest(issuesQuery, {
          project: this.project.id,
          state: ['open'],
        }).then(resp => {
          ensure(resp.body.data.issues).hasLength(3);
          const issues: Issue[] = resp.body.data.issues;
          ensure(new Set(issues.map(i => i.state))).containsExactly('open');
        });
      });

      it('states', function () {
        return graphqlRequest(issuesQuery, {
          project: this.project.id,
          state: ['open', 'closed'],
        }).then(resp => {
          ensure(resp.body.data.issues).hasLength(4);
        });
      });

      it('summary.IN', function () {
        return graphqlRequest(issuesQuery, {
          project: this.project.id,
          summary: 'RANDOM',
          summaryPred: 'IN',
        }).then(resp => {
          ensure(resp.body.data.issues).hasLength(1);
          ensure(resp.body.data.issues[0].summary).equals('a random message');
        });
      });

      it('summary.NOT_IN', function () {
        return graphqlRequest(issuesQuery, {
          project: this.project.id,
          summary: 'Random',
          summaryPred: 'NOT_IN',
        }).then(resp => {
          ensure(resp.body.data.issues).hasLength(3);
        });
      });

      it('summary.EQUALS', function () {
        return graphqlRequest(issuesQuery, {
          project: this.project.id,
          summary: 'a random message',
          summaryPred: 'EQUALS',
        }).then(resp => {
          ensure(resp.body.data.issues).hasLength(1);
          ensure(resp.body.data.issues[0].summary).equals('a random message');
        });
      });

      it('summary.NOT_EQUALS', function () {
        return graphqlRequest(issuesQuery, {
          project: this.project.id,
          summary: 'a random message',
          summaryPred: 'NOT_EQUALS',
        }).then(resp => {
          ensure(resp.body.data.issues).hasLength(3);
        });
      });

      it('summary.STARTS_WITH', function () {
        return graphqlRequest(issuesQuery, {
          project: this.project.id,
          summary: 'a random',
          summaryPred: 'STARTS_WITH',
        }).then(resp => {
          ensure(resp.body.data.issues).hasLength(1);
          ensure(resp.body.data.issues[0].summary).equals('a random message');
        });
      });

      it('summary.ENDS_WITH', function () {
        return graphqlRequest(issuesQuery, {
          project: this.project.id,
          summary: 'message',
          summaryPred: 'ENDS_WITH',
        }).then(resp => {
          ensure(resp.body.data.issues).hasLength(2);
          ensure(resp.body.data.issues[0].summary).equals('a different message');
          ensure(resp.body.data.issues[1].summary).equals('a random message');
        });
      });

      it('description.IN', function () {
        return graphqlRequest(issuesQuery, {
          project: this.project.id,
          description: 'TEXT',
          descriptionPred: 'IN',
        }).then(resp => {
          ensure(resp.body.data.issues).hasLength(1);
          ensure(resp.body.data.issues[0].description).equals('more text');
        });
      });

      it('reporter', async function () {
        await graphqlRequest(issuesQuery, {
          project: this.project.id,
          reporter: ['test-user'],
        }).then(resp => {
          ensure(resp.body.data.issues).hasLength(4);
        });

        await graphqlRequest(issuesQuery, {
          project: this.project.id,
          reporter: ['invalid-user'],
        }).then(resp => {
          ensure(resp.body.data.issues).hasLength(0);
        });
      });

      it('owner', async function () {
        await graphqlRequest(issuesQuery, {
          project: this.project.id,
          owner: ['test-user'],
        }).then(resp => {
          ensure(resp.body.data.issues).hasLength(1);
        });
      });

      it('label', async function () {
        await graphqlRequest(issuesQuery, {
          project: this.project.id,
          labels: [labelIndex],
        }).then(resp => {
          ensure(resp.body.data.issues).hasLength(1);
        });
      });

      it('custom.priority', async function () {
        await graphqlRequest(issuesQuery, {
          project: this.project.id,
          custom: { name: 'priority', value: 'P1' },
        }).then(resp => {
          ensure(resp.body.data.issues).hasLength(1);
        });
      });

      it('sort (type)', function () {
        return graphqlRequest(issuesQuery, {
          project: this.project.id,
          sort: ['type'],
        }).then(resp => {
          ensure(resp.body.data.issues).hasLength(4);
          const issues: Issue[] = resp.body.data.issues;
          const types = issues.map(i => i.type);
          ensure(types).containsExactly('bug', 'bug', 'feature', 'task').inOrder();
        });
      });

      it('sort (-type)', function () {
        return graphqlRequest(issuesQuery, {
          project: this.project.id,
          sort: ['-type'],
        }).then(resp => {
          ensure(resp.body.data.issues).hasLength(4);
          const issues: Issue[] = resp.body.data.issues;
          const types = issues.map(i => i.type);
          ensure(types).containsExactly('task', 'feature', 'bug', 'bug').inOrder();
        });
      });

      it('sort (state)', function () {
        return graphqlRequest(issuesQuery, {
          project: this.project.id,
          sort: ['state'],
        }).then(resp => {
          ensure(resp.body.data.issues).hasLength(4);
          const issues: Issue[] = resp.body.data.issues;
          const states = issues.map(i => i.state);
          ensure(states).containsExactly('closed', 'open', 'open', 'open').inOrder();
        });
      });

      it('sort (-state)', function () {
        return graphqlRequest(issuesQuery, {
          project: this.project.id,
          sort: ['-state'],
        }).then(resp => {
          ensure(resp.body.data.issues).hasLength(4);
          const issues: Issue[] = resp.body.data.issues;
          const states = issues.map(i => i.state);
          ensure(states).containsExactly('open', 'open', 'open', 'closed').inOrder();
        });
      });

      it('sort (summary)', function () {
        return graphqlRequest(issuesQuery, {
          project: this.project.id,
          sort: ['summary'],
        }).then(resp => {
          ensure(resp.body.data.issues).hasLength(4);
          const issues: Issue[] = resp.body.data.issues;
          const summarys = issues.map(i => i.summary);
          ensure(summarys).containsExactly(
              'a different message', 'a random message', 'test-summary', 'test-summary').inOrder();
        });
      });

      it('sort (description)', function () {
        return graphqlRequest(issuesQuery, {
          project: this.project.id,
          sort: ['description'],
        }).then(resp => {
          ensure(resp.body.data.issues).hasLength(4);
          const issues: Issue[] = resp.body.data.issues;
          const descriptions = issues.map(i => i.description);
          ensure(descriptions).containsExactly(
              'even more', 'more text', 'test-description', 'test-description').inOrder();
        });
      });
    });
  });
});
