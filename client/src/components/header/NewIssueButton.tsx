import { Project } from 'common/api';
import { Role } from 'common/api/Role';
import AddBoxIcon from 'icons/ic_add_box_black_24px.svg';
import * as React from 'react';
import { DefaultChildProps, graphql } from 'react-apollo';
import { Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import {
  RouteComponentProps,
} from 'react-router-dom';
import * as ProjectQuery from '../../graphql/queries/project.graphql';

type Props = RouteComponentProps<{ project: string }>;

interface Data {
  project: Project;
}

function NewIssueButton(props: DefaultChildProps<Props, Data>) {
  const { data: { project } } = props;
  if (project && project.role >= Role.REPORTER) {
    return (
      <LinkContainer
        className="header-link"
        to={{
          pathname: `/project/${project.name}/new`,
          state: { back: props.location },
        }}
      >
        <Button bsStyle="primary"><AddBoxIcon />New Issue...</Button>
      </LinkContainer>
    );
  }
  return null;
}

export default graphql(ProjectQuery, {
  options: (props: Props) => ({
    variables: { project: props.match.params.project },
  }),
})(NewIssueButton);
