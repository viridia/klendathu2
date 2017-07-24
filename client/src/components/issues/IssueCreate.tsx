import { Project, Template, Workflow } from 'common/api';
import * as React from 'react';
import {
  RouteComponentProps,
} from 'react-router-dom';
// import { toastr } from 'react-redux-toastr';
import autobind from '../../lib/autobind';
import IssueCompose from './IssueCompose';
// import { createIssue } from 'src/store/reducers/issue';

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
  private onSave(issueId: number, issue: string) {
    // return createIssue(this.props.project.id, issue).then(resp => {
    //   toastr.success(`Issue #${resp.data.newIssue.id} created.`);
    // });
  }
}
