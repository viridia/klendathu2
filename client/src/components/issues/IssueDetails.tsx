import autobind from 'bind-decorator';
import {
  CustomField,
  FieldType,
  Issue,
  IssueType,
  Project,
  Relation,
  Role,
  Template,
  Workflow,
  WorkflowAction,
} from 'common/api';
import * as Immutable from 'immutable';
import * as marked from 'marked';
import * as React from 'react';
import { DefaultChildProps, graphql } from 'react-apollo';
import { Button, ButtonGroup } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
// import ShowAttachments from '../files/showAttachments.jsx';
import { addComment, deleteIssue, updateIssue } from '../../store/reducers/issue';
import ConfirmDialog from '../common/ConfirmDialog';
import LabelName from '../common/LabelName';
import RelativeDate from '../common/RelativeDate';
import UserName from '../common/UserName';
import ErrorDisplay from '../debug/ErrorDisplay';
import CommentEdit from './input/CommentEdit';
import IssueChanges from './IssueChanges';
import IssueLinks from './IssueLinks';
import WorkflowActions from './workflow/WorkflowActions';

import './IssueDetails.scss';

import * as IssueDetailsQuery from '../../graphql/queries/issueDetails.graphql';

import ArrowBackIcon from 'icons/ic_arrow_back_black_24px.svg';
import ArrowForwardIcon from 'icons/ic_arrow_forward_black_24px.svg';
import ArrowUpIcon from 'icons/ic_arrow_upward_black_24px.svg';

const equal = require('deep-equal');

// Global options for marked.
marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: true,
});

interface Props extends RouteComponentProps<{ id: string }> {
  project: Project;
  template: Template;
  workflow: Workflow;
}

interface Data {
  issue: Issue;
}

interface State {
  showDelete: boolean;
  busyDelete: boolean;
  prevIssue?: number;
  nextIssue?: number;
}

class IssueDetails extends React.Component<DefaultChildProps<Props, Data>, State> {
  constructor(props: DefaultChildProps<Props, Data>) {
    super(props);
  //   this.onExecAction = this.onExecAction.bind(this);
    this.state = {
      ...this.navState(props),
      showDelete: false,
      busyDelete: false,
    };
  }

  public componentWillReceiveProps(nextProps: DefaultChildProps<Props, Data>) {
    this.setState(this.navState(nextProps));
  }

  public shouldComponentUpdate(nextProps: DefaultChildProps<Props, Data>, nextState: State) {
    if (this.state.prevIssue !== nextState.prevIssue ||
        this.state.nextIssue !== nextState.nextIssue ||
        this.state.showDelete !== nextState.showDelete ||
        this.state.busyDelete !== nextState.busyDelete) {
      return true;
    }
    if (this.props.data.issue === nextProps.data.issue) {
      return false;
    }
    if (this.props.data.issue && nextProps.data.issue) {
      const thisIssue = this.props.data.issue;
      const nextIssue = nextProps.data.issue;
      return !equal(thisIssue, nextIssue);
    }
    return true;
  }

  public render() {
    const { location, project, template, workflow } = this.props;
    const { issue, error } = this.props.data;
    const { prevIssue, nextIssue, showDelete, busyDelete } = this.state;
    if (error) {
      return <ErrorDisplay error={error} />;
    }
    if (!issue) {
      return <section className="kdt issue-details" />;
    }
    const {
      labels = [],
      comments = [],
      changes = [],
      custom = [],
    //   attachmentsData = [],
    } = issue;
    const linked = Immutable.OrderedMap<number, Relation>(
        issue.linked.map(({ relation, to }) => ([to, relation] as [number, Relation])));
    const issueType = template.types.find(t => t.id === issue.type);
    const issueState = workflow.states.find(st => st.id === issue.state);
    const backLink = (location.state && location.state.back) || { pathname: '..' };
    return (
      <section className="kdt issue-details">
        <section className="card">
          <header>
            <LinkContainer to={backLink} exact={true}>
              <Button title="Back to issue list" className="issue-up"><ArrowUpIcon /></Button>
            </LinkContainer>
            <div className="issue-id">Issue #{issue.id}: </div>
            <div className="summary">{issue.summary}</div>
            <div className="stretch">
              <div className="issue-type" style={{ backgroundColor: issueType.bg }}>
                {issueType.caption}
              </div>
            </div>
            <ButtonGroup className="issue-actions">
              <LinkContainer
                  to={{
                    pathname: `/project/${project.name}/edit/${issue.id}`,
                    state: { ...location.state, back: this.props.location },
                  }}
              >
                <Button title="Edit issue" disabled={project.role < Role.UPDATER}>Edit</Button>
              </LinkContainer>
              <Button
                  title="Delete issue"
                  bsStyle="default"
                  disabled={project.role < Role.MANAGER}
                  onClick={this.onDeleteIssue}
              >
                Delete
              </Button>
            </ButtonGroup>
            <ButtonGroup className="issue-nav">
              <LinkContainer
                  to={{ ...location, pathname: `/project/${project.name}/issues/${prevIssue}` }}
              >
                <Button title="Previous issue" disabled={prevIssue === null}>
                  <ArrowBackIcon />
                </Button>
              </LinkContainer>
              <LinkContainer
                  to={{ ...location, pathname: `/project/${project.name}/issues/${nextIssue}` }}
              >
                <Button title="Next issue" disabled={nextIssue === null}>
                  <ArrowForwardIcon />
                </Button>
              </LinkContainer>
            </ButtonGroup>
          </header>
          <section className="content">
            <div className="left">
              <table className="create-issue-table form-table">
                <tbody>
                  <tr>
                    <th className="header">State:</th>
                    <td className="state">{issueState && issueState.caption}</td>
                  </tr>
                  {issue.summary.length > 0 && (
                    <tr>
                      <th className="header">Summary:</th>
                      <td>{issue.summary}</td>
                    </tr>
                  )}
                  {issue.description.length > 0 && (
                    <tr>
                      <th className="header">Description:</th>
                      {this.renderDescription(issue.description)}
                    </tr>
                  )}
                  <tr>
                    <th className="header">Created:</th>
                    <td className="changes">
                      <RelativeDate date={new Date(issue.created)} />
                    </td>
                  </tr>
                  <tr>
                    <th className="header">Reporter:</th>
                    <td className="reporter">
                      {issue.reporter
                        ? <UserName user={issue.reporter} full={true} />
                        : <span className="unassigned">unassigned</span>}
                    </td>
                  </tr>
                  <tr>
                    <th className="header">Owner:</th>
                    <td>
                      {issue.owner
                        ? <UserName user={issue.owner} full={true} />
                        : <span className="unassigned">unassigned</span>}
                    </td>
                  </tr>
                  {issue.cc.length > 0 && (
                    <tr>
                      <th className="header">CC:</th>
                      <td>{issue.cc.map(cc => <UserName user={cc} key={cc} full={true} />)}
                      </td>
                    </tr>
                  )}
                  {this.renderTemplateFields(issueType, custom)}
                  {labels.length > 0 && (
                    <tr>
                      <th className="header labels">Labels:</th>
                      <td>
                        {labels.map(label =>
                          <LabelName label={label} project={project.id} key={label} />)}
                      </td>
                    </tr>
                  )}
                  {/*
                  {attachmentsData.length > 0 && (
                    <tr>
                      <th className="header">Attachments:</th>
                      <td><ShowAttachments attachments={attachmentsData} /></td>
                    </tr>
                  )}
                  */}
                  {linked.size > 0 && <tr>
                    <th className="header linked">Linked Issues:</th>
                    <td>
                      <IssueLinks
                          project={project}
                          links={linked}
                      />
                    </td>
                  </tr>}
                  {((comments || []).length > 0 || (changes || []).length > 0) && <tr>
                    <th className="header history">Issue History:</th>
                    <td>
                      <IssueChanges
                          issue={issue}
                          comments={comments}
                          changes={changes}
                          project={project}
                      />
                    </td>
                  </tr>}
                  <tr>
                    <th className="header" />
                    <td>
                      <CommentEdit project={project} onAddComment={this.onAddComment} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {project.role >= Role.UPDATER && (<aside className="right">
              <WorkflowActions
                  workflow={workflow}
                  state={issue.state}
                  issue={issue}
                  onExecAction={this.onExecAction}
              />
            </aside>)}
          </section>
        </section>
        {showDelete && (<ConfirmDialog
            title="Are you sure you want to delete this issue?"
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={this.onConfirmDelete}
            onCancel={this.onCancelDelete}
            busy={busyDelete}
        >
          This action cannot be undone.
        </ConfirmDialog>)}
      </section>
    );
  }

  private renderDescription(description: string) {
    return <td className="descr" dangerouslySetInnerHTML={{ __html: marked(description) }} />;
  }

  private renderTemplateFields(issueType: IssueType, custom: CustomField[]) {
    const result = [];
    const fields = this.customFieldList(issueType);
    const customMap = new Map(custom.map(field => [field.name, field.value] as [string, string]));
    for (const field of fields) {
      const value = customMap.get(field.id);
      if (value) {
        switch (field.type) {
          case 'TEXT':
            result.push(
              <tr key={field.id}>
                <th>{field.caption}:</th>
                <td>{value}</td>
              </tr>);
            break;
          case 'ENUM':
            result.push(
              <tr key={field.id}>
                <th>{field.caption}:</th>
                <td>{value}</td>
              </tr>);
            break;
          default:
            console.error('invalid field type:', field.type);
            break;
        }
      }
    }
    return result;
  }

  // // TODO: combine this with the one in issueCompose?
  private customFieldList(issueType: IssueType): FieldType[] {
    let fields: FieldType[] = [];
    if (issueType.extends && issueType.extends.startsWith('./')) {
      const parentType = this.getIssueType(issueType.extends.slice(2));
      if (parentType) {
        fields = this.customFieldList(parentType);
      }
    }
    if (issueType.fields) {
      fields = fields.concat(issueType.fields);
    }
    return fields;
  }

  private getIssueType(id: string): IssueType {
    return this.props.template.types.find(type => type.id === id);
  }

  /** Compute the next and previous issue id given the list of issue ids passed in. */
  private navState(props: DefaultChildProps<Props, Data>) {
    const { location: { state }, data: { issue } } = props;
    let prevIssue = null;
    let nextIssue = null;
    if (issue && state && state.idList && state.idList.length > 0) {
      const index = Math.max(0, state.idList.indexOf(issue.id));
      if (index > 0) {
        prevIssue = state.idList[index - 1];
      }
      if (index < state.idList.length - 1) {
        nextIssue = state.idList[index + 1];
      }
    }
    return { prevIssue, nextIssue };
  }

  @autobind
  private onAddComment(newComment: string) {
    const { project, data: { issue } } = this.props;
    return addComment(project.id, issue.id, newComment).then(() => {
      this.props.data.refetch();
    });
  }

  @autobind
  private onExecAction(action: WorkflowAction) {
    const { project, data: { issue } } = this.props;
    const updates = {
      state: action.state,
      owner: action.owner,
    };
    return updateIssue(project.id, issue.id, updates).then(() => {
      this.props.data.refetch();
    });
  }

  @autobind
  private onDeleteIssue() {
    this.setState({ showDelete: true, busyDelete: false });
  }

  @autobind
  private onConfirmDelete() {
    const { location, history, project, data: { issue } } = this.props;
    this.setState({ busyDelete: true });
    return deleteIssue(project.id, issue.id).then(() => {
      const { prevIssue, nextIssue } = this.state;
      this.setState({ showDelete: false, busyDelete: false });
      if (prevIssue) {
        history.replace({
          ...location,
          pathname: `/project/${project.name}/issues/${prevIssue}`,
        });
      } else if (nextIssue) {
        history.replace({
          ...location,
          pathname: `/project/${project.name}/issues/${nextIssue}`,
        });
      } else if (location.state && location.state.back) {
        history.replace(location.state.back);
      } else {
        history.replace({
          ...location,
          pathname: `/project/${project.name}/issues`,
        });
      }
    });
  }

  @autobind
  private onCancelDelete() {
    this.setState({ showDelete: false, busyDelete: false });
  }
}

export default graphql(IssueDetailsQuery, {
  options: ({ project, match }: Props) => ({
    variables: { project: project.id, id: parseInt(match.params.id, 10) },
  }),
})(IssueDetails);
