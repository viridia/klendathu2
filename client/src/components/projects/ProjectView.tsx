import autobind from 'bind-decorator';
import { Project, Template, Workflow } from 'common/api';
import * as PropTypes from 'prop-types';
import * as React from 'react';
import { compose, graphql, QueryProps } from 'react-apollo';
import {
  Route,
  RouteComponentProps,
  Switch,
} from 'react-router-dom';
import ErrorDisplay from '../debug/ErrorDisplay';
import IssueCreate from '../issues/IssueCreate';
import IssueDetails from '../issues/IssueDetails';
import IssueEdit from '../issues/IssueEdit';
import IssueListView from '../issues/IssueListView';
import LabelList from '../labels/LabelList';
import LeftNav from '../nav/LeftNav';

import * as ProjectQuery from '../../graphql/queries/project.graphql';
import * as TemplateAndWorkflowQuery from '../../graphql/queries/templateAndWorkflow.graphql';

type Props = RouteComponentProps<{ project: string }>;

interface DataProps {
  data: QueryProps & {
    project: Project;
  };
  support: QueryProps & {
    template: Template;
    workflow: Workflow;
  };
}

class ProjectView extends React.Component<DataProps, undefined> {
  public static contextTypes = {
    profile: PropTypes.shape({
      username: PropTypes.string.isRequired,
    }),
  };

  public render() {
    const { data, support } = this.props;
    if (data.error) {
      return <ErrorDisplay error={data.error} />;
    } else if (support && support.error) {
      return <ErrorDisplay error={support.error} />;
    } else if (!support || data.loading || support.loading) {
      return <div className="content" />;
    } else if (!this.context.profile) {
      return <div className="content">Profile not loaded</div>;
    } else if (!data.project) {
      return <div className="content">Project not found</div>;
    } else if (!support.workflow) {
      return <div className="content">Workflow not found</div>;
    } else if (!support.template) {
      return <div className="content">Template not found</div>;
    }
    return (
      <div className="content">
        <LeftNav project={data.project} />
        <Switch>
          <Route path="/project/:project/new" render={this.renderIssueCreate}/>
          <Route path="/project/:project/edit/:id" render={this.renderIssueEdit} />
          <Route path="/project/:project/issues/:id" render={this.renderIssueDetails} />
          <Route path="/project/:project/issues" exact={true} render={this.renderIssueList} />
          <Route path="/project/:project/labels" render={this.renderLabelList} />
          <Route path="/project/:project/settings" />
          <Route path="/project/:project" />
        </Switch>
      </div>
    );
  }

  @autobind
  private renderIssueCreate(props: RouteComponentProps<{}>) {
    const { data: { project }, support: { template, workflow } } = this.props;
    return (<IssueCreate {...props} project={project} template={template} workflow={workflow} />);
  }

  @autobind
  private renderIssueEdit(props: RouteComponentProps<{ id: string }>) {
    const { data: { project }, support: { template, workflow } } = this.props;
    return (
      <IssueEdit
        {...props}
        project={project}
        template={template}
        workflow={workflow}
        issue={props.match.params.id}
      />);
  }

  @autobind
  private renderIssueDetails(props: RouteComponentProps<{ id: string }>) {
    const { data: { project }, support: { template, workflow } } = this.props;
    return (<IssueDetails {...props} project={project} template={template} workflow={workflow} />);
  }

  @autobind
  private renderIssueList(props: RouteComponentProps<{}>) {
    const { data: { project }, support: { template, workflow } } = this.props;
    return (
      <IssueListView {...props} project={project} template={template} workflow={workflow} />
    );
  }

  @autobind
  private renderLabelList(props: RouteComponentProps<{}>) {
    const { data: { project } } = this.props;
    return (<LabelList {...props} project={project} />);
  }
}

export default compose(
  graphql(ProjectQuery, {
    options: (props: Props) => ({
      variables: { project: props.match.params.project },
    }),
  }),
  graphql(TemplateAndWorkflowQuery, {
    name: 'support',
    skip: (props: { data: { project?: Project }}) => {
      return !props.data || !props.data.project;
    },
    options: (props: { data: { project?: Project }}) => ({
      variables: {
        template: props.data && props.data.project && props.data.project.template || 'std/software',
        workflow: props.data && props.data.project && props.data.project.workflow || 'std/bugtrack',
      },
    }),
  }),
)(ProjectView);
