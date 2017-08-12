import autobind from 'bind-decorator';
import { Issue, Project, Template, Workflow } from 'common/api';
import * as React from 'react';
import { toastr } from 'react-redux-toastr';
import { RouteComponentProps } from 'react-router-dom';
import { createIssue } from '../../store/reducers/issue';
import IssueCompose from './IssueCompose';

interface Props extends RouteComponentProps<{}> {
  project: Project;
  template: Template;
  workflow: Workflow;
}

export default class IssueCreate extends React.Component<Props, undefined> {
  public render() {
    return (
      <IssueCompose
          {...this.props}
          issue={null}
          onSave={this.onSave}
      />);
  }

  @autobind
  private onSave(issueId: number, issue: Partial<Issue>): Promise<any> {
    return createIssue(this.props.project.id, issue as Issue).then((resp: any) => {
      toastr.success('', `Issue #${resp.data.newIssue.id} created.`);
    });
  }
}
