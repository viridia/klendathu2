import autobind from 'bind-decorator';
import { Issue, Project, Template, Workflow } from 'common/api';
import * as React from 'react';
import { DefaultChildProps, graphql } from 'react-apollo';
import { toastr } from 'react-redux-toastr';
import { RouteComponentProps } from 'react-router-dom';
import { updateIssue } from '../../store/reducers/issue';
import IssueCompose from './IssueCompose';

import * as IssueQuery from '../../graphql/queries/issue.graphql';

interface Props extends RouteComponentProps<{}> {
  issue?: string;
  project: Project;
  template: Template;
  workflow: Workflow;
}

interface Data {
  issue: Issue;
}

class IssueEdit extends React.Component<DefaultChildProps<Props, Data>> {
  public render() {
    return (this.props.data.issue ? (
      <IssueCompose
          {...this.props}
          issue={this.props.data.issue}
          onSave={this.onSave}
      />) : null);
  }

  @autobind
  private onSave(issueId: number, issue: Partial<Issue>) {
    return updateIssue(this.props.project.id, issueId, issue).then((resp: any) => {
      toastr.success(null, `Issue #${resp.data.updateIssue.id} updated.`);
      this.props.history.goBack();
    });
  }
}

export default graphql(IssueQuery, {
  options: ({ project, issue }: Props) => ({
    variables: { project: project.id, id: parseInt(issue, 10) },
  }),
})(IssueEdit);
