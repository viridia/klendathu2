import { Issue } from 'common/api';
import * as React from 'react';
import { DefaultChildProps, graphql } from 'react-apollo';
import * as IssueQuery from '../../graphql/queries/issue.graphql';
import './LabelName.scss';

interface Props {
  id: number;
  project: string;
}

interface Data {
  issue: Issue;
}

/** Component that displays an issue as a single-line summary. */
function IssueSummary(props: DefaultChildProps<Props, Data>) {
  const issue = this.props.data.issue;
  if (issue) {
    return (
      <span className="issue">
        <span className="id">#{issue.id}</span>
        <span className="summary">: {issue.summary}</span>
      </span>);
  } else {
    return (
      <span className="issue">
        <span className="id">#{this.props.id}</span>
        <span className="summary unknown">: unknown issue</span>
      </span>);
  }
}

export default graphql(IssueQuery, {
  options: ({ id, project }: Props) => ({
    variables: { id, project },
  }),
})(IssueSummary);
