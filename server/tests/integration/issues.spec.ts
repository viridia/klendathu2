import { ensure } from 'certainty';
import { Issue } from 'common/api';
import {
  changesTo,
  clearAllTables,
  clearProjects,
  createApp,
  createTestAccount,
  createTestProject,
  graphqlRequest,
  linksFrom,
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
    comments {
      id
      author
      body
      created
    }
    linked {
      relation
      to
    }
  }
}`;

const updateIssueMutation = `mutation updateIssue($project: ID!, $id: Int!, $input: IssueInput!) {
  updateIssue(id: $id, project: $project, input: $input) {
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
    comments {
      id
      author
      body
      created
    }
    linked {
      relation
      to
    }
  }
}`;

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
    comments {
      id
      author
      body
      created
    }
    linked {
      relation
      to
    }
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
  // custom {
  //   name
  //   value
  // }
  // attachmentsData {
  //   id
  //   filename
  //   url
  //   thumb
  //   type
  // }

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
  this.slow(300);

  before(createApp);
  before(clearAllTables());
  before(createTestAccount);

  after(clearAllTables());
  after(function () {
    this.app.stop();
  });

  describe('mutation', function () {
    let issueId: number;

    before(createTestProject);
    after(clearProjects());

    describe('newIssue', function () {
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
          issueId = resp.body.data.newIssue.id;
        });
      });
    });

    describe('updateIssue', function () {
      it('type', function () {
        return graphqlRequest(updateIssueMutation, {
          project: this.project.id,
          id: issueId,
          input: {
            type: 'feature',
          },
        }).then(resp => {
          const record = resp.body.data.updateIssue;
          ensure(record).exists();
          ensure(record.id).equals(1);
          ensure(record.project).equals(this.project.id);
          ensure(record.type).equals('feature');
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

      it('state', function () {
        return graphqlRequest(updateIssueMutation, {
          project: this.project.id,
          id: issueId,
          input: {
            state: 'closed',
          },
        }).then(resp => {
          const record = resp.body.data.updateIssue;
          ensure(record.state).equals('closed');
        });
      });

      it('summary, description', function () {
        return graphqlRequest(updateIssueMutation, {
          project: this.project.id,
          id: issueId,
          input: {
            summary: 'modified-summary',
            description: 'modified-description',
          },
        }).then(resp => {
          const record = resp.body.data.updateIssue;
          ensure(record.summary).equals('modified-summary');
          ensure(record.description).equals('modified-description');
        });
      });

      it('owner (null)', function () {
        return graphqlRequest(updateIssueMutation, {
          project: this.project.id,
          id: issueId,
          input: {
            owner: null,
          },
        }).then(resp => {
          const record = resp.body.data.updateIssue;
          ensure(record.owner).isNull();
        });
      });

      it('owner, cc', function () {
        return graphqlRequest(updateIssueMutation, {
          project: this.project.id,
          id: issueId,
          input: {
            owner: 'test-user',
            cc: ['test-user'],
          },
        }).then(resp => {
          const record = resp.body.data.updateIssue;
          ensure(record.owner).equals('test-user');
          ensure(record.cc).isDeeplyEqualTo(['test-user']);
        });
      });

      it('labels', function () {
        return graphqlRequest(updateIssueMutation, {
          project: this.project.id,
          id: issueId,
          input: {
            owner: 'test-user',
            cc: ['test-user'],
          },
        }).then(resp => {
          const record = resp.body.data.updateIssue;
          ensure(record.owner).equals('test-user');
          ensure(record.cc).isDeeplyEqualTo(['test-user']);
        });
      });

      it('comments', async function () {
        this.slow(400);
        await graphqlRequest(updateIssueMutation, {
          project: this.project.id,
          id: issueId,
          input: {
            comments: [{ body: 'A comment' }],
          },
        }).then(resp => {
          const record = resp.body.data.updateIssue;
          ensure(record.comments).hasLength(1);
          ensure(record.comments[0].id).equals(1);
          ensure(record.comments[0].body).equals('A comment');
          ensure(record.comments[0].author).equals('test-user');
        });

        await graphqlRequest(updateIssueMutation, {
          project: this.project.id,
          id: issueId,
          input: {
            comments: [{ body: 'Another comment' }, { id: 1, body: 'Updated comment' }],
          },
        }).then(resp => {
          const record = resp.body.data.updateIssue;
          ensure(record.comments).hasLength(2);
          ensure(record.comments[0].id).equals(1);
          ensure(record.comments[0].body).equals('Updated comment');
          ensure(record.comments[0].author).equals('test-user');
          ensure(record.comments[1].id).equals(2);
          ensure(record.comments[1].body).equals('Another comment');
          ensure(record.comments[1].author).equals('test-user');
        });
      });

      it('linked', async function () {
        this.slow(1000);
        let otherIssue: number;
        await graphqlRequest(newIssueMutation, {
          project: this.project.id,
          input: {
            type: 'bug',
            state: 'open',
            summary: 'test-summary',
            description: 'test-description',
          },
        }).then(resp => {
          otherIssue = resp.body.data.newIssue.id;
        });

        // Establish a new link
        await graphqlRequest(updateIssueMutation, {
          project: this.project.id,
          id: issueId,
          input: {
            linked: [
              { to: otherIssue, relation: 'BLOCKED_BY' },
            ],
          },
        }).then(resp => {
          const record = resp.body.data.updateIssue;
          ensure(record.linked).isDeeplyEqualTo([{ to: otherIssue, relation: 'BLOCKED_BY' }]);
        });

        let links = await linksFrom(this.project.id, issueId);
        ensure(links).hasLength(1);
        ensure(links[0].project).equals(this.project.id);
        ensure(links[0].from).equals(issueId);
        ensure(links[0].to).equals(otherIssue);
        ensure(links[0].relation).equals('BLOCKED_BY');

        links = await linksFrom(this.project.id, otherIssue);
        ensure(links).hasLength(1);
        ensure(links[0].project).equals(this.project.id);
        ensure(links[0].from).equals(otherIssue);
        ensure(links[0].to).equals(issueId);
        ensure(links[0].relation).equals('BLOCKS');

        // Change the type of the new link
        await graphqlRequest(updateIssueMutation, {
          project: this.project.id,
          id: issueId,
          input: {
            linked: [
              { to: otherIssue, relation: 'PART_OF' },
            ],
          },
        }).then(resp => {
          const record = resp.body.data.updateIssue;
          ensure(record.linked).isDeeplyEqualTo([{ to: otherIssue, relation: 'PART_OF' }]);
        });

        links = await linksFrom(this.project.id, issueId);
        ensure(links).hasLength(1);
        ensure(links[0].project).equals(this.project.id);
        ensure(links[0].from).equals(issueId);
        ensure(links[0].to).equals(otherIssue);
        ensure(links[0].relation).equals('PART_OF');

        links = await linksFrom(this.project.id, otherIssue);
        ensure(links).hasLength(1);
        ensure(links[0].project).equals(this.project.id);
        ensure(links[0].from).equals(otherIssue);
        ensure(links[0].to).equals(issueId);
        ensure(links[0].relation).equals('HAS_PART');

        // Delete the links
        await graphqlRequest(updateIssueMutation, {
          project: this.project.id,
          id: issueId,
          input: {
            linked: [],
          },
        }).then(resp => {
          const record = resp.body.data.updateIssue;
          ensure(record.linked).isDeeplyEqualTo([]);
        });

        links = await linksFrom(this.project.id, issueId);
        ensure(links).isEmpty();

        links = await linksFrom(this.project.id, otherIssue);
        ensure(links).isEmpty();

        const otherChanges = await changesTo(this.project.id, otherIssue);
        ensure(otherChanges).hasLength(3);
        ensure(otherChanges[0].by).equals('test-user');
        ensure(otherChanges[0].project).equals(this.project.id);
        ensure(otherChanges[0].linked).isDeeplyEqualTo([{
          after: 'BLOCKS',
          to: issueId,
        }]);

        ensure(otherChanges[1].by).equals('test-user');
        ensure(otherChanges[1].project).equals(this.project.id);
        ensure(otherChanges[1].linked).isDeeplyEqualTo([{
          before: 'BLOCKS',
          after: 'HAS_PART',
          to: issueId,
        }]);

        ensure(otherChanges[2].by).equals('test-user');
        ensure(otherChanges[2].project).equals(this.project.id);
        ensure(otherChanges[2].linked).isDeeplyEqualTo([{
          before: 'HAS_PART',
          to: issueId,
        }]);
      });

      it('changes', async function () {
        const changes = await changesTo(this.project.id, issueId);
        // console.log(JSON.stringify(changes, null, 2));
        ensure(changes).hasLength(7);

        for (const ch of changes) {
          ensure(ch.issue).equals(issueId);
          ensure(ch.by).equals('test-user');
          ensure(ch.project).equals(this.project.id);
          ensure(ch.at).isNotNull();
        }

        ensure(changes[0].type).isDeeplyEqualTo({
          before: 'bug',
          after: 'feature',
        });

        ensure(changes[1].state).isDeeplyEqualTo({
          before: 'open',
          after: 'closed',
        });

        ensure(changes[2].description).isDeeplyEqualTo({
          before: 'test-description',
          after: 'modified-description',
        });
        ensure(changes[2].summary).isDeeplyEqualTo({
          before: 'test-summary',
          after: 'modified-summary',
        });

        ensure(changes[3].owner).isDeeplyEqualTo({
          before: null,
          after: 'test-user',
        });
        ensure(changes[3].cc).isDeeplyEqualTo({
          added: ['test-user'],
          removed: [],
        });

        ensure(changes[4].linked).isDeeplyEqualTo([{
          after: 'BLOCKED_BY',
          to: 2,
        }]);

        ensure(changes[5].linked).isDeeplyEqualTo([{
          before: 'BLOCKED_BY',
          after: 'PART_OF',
          to: 2,
        }]);

        ensure(changes[6].linked).isDeeplyEqualTo([{
          before: 'PART_OF',
          to: 2,
        }]);
      });
    });
  });

  describe('query', function () {
    let labelIndex: number;
    let issue0: number;
    let issue1: number;
    let issue2: number;
    let issue3: number;

    before(createTestProject);
    after(clearProjects());

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

      // Create four issues
      await graphqlRequest(newIssueMutation, {
        project: this.project.id,
        input: {
          type: 'bug',
          state: 'open',
          summary: 'test-summary',
          description: 'test-description',
        },
      }).then(resp => {
        issue0 = resp.body.data.newIssue.id;
      });

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
