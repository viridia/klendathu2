import { Project } from 'common/api';
import * as React from 'react';
import {
  RouteComponentProps,
} from 'react-router-dom';
// import { graphql } from 'react-apollo';
// import { browserHistory } from 'react-router';
// import marked from 'marked';
// import Button from 'react-bootstrap/lib/Button';
// import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
// import { LinkContainer } from 'react-router-bootstrap';
// import ArrowBackIcon from 'icons/ic_arrow_back_black_24px.svg';
// import ArrowForwardIcon from 'icons/ic_arrow_forward_black_24px.svg';
// import ArrowUpIcon from 'icons/ic_arrow_upward_black_24px.svg';
// import ErrorDisplay from '../debug/errorDisplay.jsx';
// import UserName from '../common/userName.jsx';
// import LabelName from '../common/labelName.jsx';
// import RelativeDate from '../common/relativeDate.jsx';
// import ConfirmDialog from '../common/confirmDialog.jsx';
// import IssueChanges from './issueChanges.jsx';
// import CommentEdit from './commentEdit.jsx';
// import { Role } from '../../lib/role';
// import IssueDetailsQuery from '../../graphql/queries/issueDetails.graphql';
// import IssueLinks from './linkedIssues.jsx';
// import WorkflowActions from './workflowActions.jsx';
// import ShowAttachments from '../files/showAttachments.jsx';
// import { addComment, updateIssue, deleteIssue } from '../../store/issue';
// import './issueDetails.scss';

// Global options for marked.
// marked.setOptions({
//   renderer: new marked.Renderer(),
//   gfm: true,
//   tables: true,
//   breaks: false,
//   pedantic: false,
//   sanitize: true,
//   smartLists: true,
//   smartypants: true,
// });

interface Props extends RouteComponentProps<{}> {
  project: Project;
}

class IssueDetails extends React.Component<Props> {
  // constructor(props) {
  //   super(props);
  //   this.onAddComment = this.onAddComment.bind(this);
  //   this.onExecAction = this.onExecAction.bind(this);
  //   this.onDeleteIssue = this.onDeleteIssue.bind(this);
  //   this.onConfirmDelete = this.onConfirmDelete.bind(this);
  //   this.onCancelDelete = this.onCancelDelete.bind(this);
  //   this.state = {
  //     ...this.navState(props),
  //     showDelete: false,
  //     busyDelete: false,
  //   };
  // }
  //
  // componentWillReceiveProps(nextProps) {
  //   this.setState(this.navState(nextProps));
  // }
  //
  // shouldComponentUpdate(nextProps, nextState) {
  //   if (this.state.prevIssue !== nextState.prevIssue ||
  //       this.state.nextIssue !== nextState.nextIssue ||
  //       this.state.showDelete !== nextState.showDelete ||
  //       this.state.busyDelete !== nextState.busyDelete) {
  //     return true;
  //   }
  //   if (this.props.data.issue === nextProps.data.issue) {
  //     return false;
  //   }
  //   if (this.props.data.issue && nextProps.data.issue) {
  //     const thisIssue = this.props.data.issue;
  //     const nextIssue = nextProps.data.issue;
  //     if (thisIssue.id !== nextIssue.id ||
  //         thisIssue.state !== nextIssue.state ||
  //         thisIssue.summary !== nextIssue.summary ||
  //         thisIssue.description !== nextIssue.description ||
  //         thisIssue.owner !== nextIssue.owner ||
  //         thisIssue.report !== nextIssue.reporter) {
  //       return true;
  //     }
  //     // Works because issues only contain arrays and plain objects.
  //     return JSON.stringify(thisIssue) !== JSON.stringify(nextIssue);
  //   }
  //   return true;
  // }
  //
  // onAddComment(newComment) {
  //   const { project, data: { issue } } = this.props;
  //   return addComment(project.id, issue.id, newComment).then(() => {
  //     this.props.data.refetch();
  //   });
  // }
  //
  // onExecAction(action) {
  //   const { project, data: { issue } } = this.props;
  //   const updates = {
  //     state: action.state,
  //     owner: action.owner,
  //   };
  //   return updateIssue(project.id, issue.id, updates).then(() => {
  //     this.props.data.refetch();
  //   });
  // }
  //
  // onDeleteIssue(e) {
  //   e.preventDefault();
  //   this.setState({ showDelete: true, busyDelete: false });
  // }
  //
  // onConfirmDelete() {
  //   const { location, project, data: { issue } } = this.props;
  //   this.setState({ busyDelete: true });
  //   return deleteIssue(project.id, issue.id).then(() => {
  //     const { prevIssue, nextIssue } = this.state;
  //     this.setState({ showDelete: false, busyDelete: false });
  //     if (prevIssue) {
  //       browserHistory.replace({
  //         ...location,
  //         pathname: `/project/${project.name}/issues/${prevIssue}`,
  //       });
  //     } else if (nextIssue) {
  //       browserHistory.replace({
  //         ...location,
  //         pathname: `/project/${project.name}/issues/${nextIssue}`,
  //       });
  //     } else if (location.state && location.state.back) {
  //       browserHistory.replace(location.state.back);
  //     } else {
  //       browserHistory.replace({
  //         ...location,
  //         pathname: `/project/${project.name}/issues`,
  //       });
  //     }
  //   });
  // }
  //
  // onCancelDelete() {
  //   this.setState({ showDelete: false, busyDelete: false });
  // }
  //
  // /** Compute the next and previous issue id given the list of issue ids passed in. */
  // navState(props) {
  //   const { location: { state }, data: { issue } } = props;
  //   let prevIssue = null;
  //   let nextIssue = null;
  //   if (issue && state && state.idList && state.idList.length > 0) {
  //     const index = Math.max(0, state.idList.indexOf(issue.id));
  //     if (index > 0) {
  //       prevIssue = state.idList[index - 1];
  //     }
  //     if (index < state.idList.length - 1) {
  //       nextIssue = state.idList[index + 1];
  //     }
  //   }
  //   return { prevIssue, nextIssue };
  // }
  //
  // // TODO: combine this with the one in issueCompose?
  // customFieldList(issueType) {
  //   let fields = [];
  //   const { project } = this.props;
  //   if (issueType.extends && issueType.extends.startsWith('./')) {
  //     const parentType = project.template.typesById.get(issueType.extends.slice(2));
  //     if (parentType) {
  //       fields = this.customFieldList(parentType);
  //     }
  //   }
  //   if (issueType.fields) {
  //     fields = fields.concat(issueType.fields);
  //   }
  //   return fields;
  // }
  //
  // renderTemplateFields(issueType, custom) {
  //   const result = [];
  //   const fields = this.customFieldList(issueType);
  //   const customMap = new Map(custom.map(field => [field.name, field.value]));
  //   for (const field of fields) {
  //     const value = customMap.get(field.id);
  //     if (value) {
  //       switch (field.type) {
  //         case 'TEXT':
  //           result.push(<tr key={field.id}>
  //             <th>{field.caption}:</th>
  //             <td>{value}</td>
  //           </tr>);
  //           break;
  //         case 'ENUM':
  //           result.push(<tr key={field.id}>
  //             <th>{field.caption}:</th>
  //             <td>{value}</td>
  //           </tr>);
  //           break;
  //         default:
  //           console.error('invalid field type:', field.type);
  //           break;
  //       }
  //     }
  //   }
  //   return result;
  // }
  //
  // renderDescription(description) {
  //   return <td className="descr" dangerouslySetInnerHTML={{ __html: marked(description) }} />;
  // }

  public render() {
    // const { location, project } = this.props;
    // const { issue, error } = this.props.data;
    // const { prevIssue, nextIssue, showDelete, busyDelete } = this.state;
    // if (error) {
    //   return <ErrorDisplay error={error} />;
    // }
    // if (!issue) {
    //   return <section className="kdt issue-details" />;
    // }
    // const {
    //   labels = [],
    //   comments = [],
    //   changes = [],
    //   linked = [],
    //   custom = [],
    //   attachmentsData = [],
    // } = issue;
    // const issueType = project.template.typesById.get(issue.type);
    // const backLink = (location.state && location.state.back) || { pathname: '..' };
    // const typeInfo = project.template.typesById.get(issue.type);
    // return (<section className="kdt issue-details">
    //   <section className="card">
    //     <header>
    //       <LinkContainer to={backLink}>
    //         <Button title="Back to issue list" className="issue-up"><ArrowUpIcon /></Button>
    //       </LinkContainer>
    //       <div className="issue-id">Issue #{issue.id}: </div>
    //       <div className="summary">{issue.summary}</div>
    //       <div className="stretch">
    //         <div className="issue-type" style={{ backgroundColor: typeInfo.bg }}>
    //           {typeInfo.caption}
    //         </div>
    //       </div>
    //       <ButtonGroup className="issue-actions">
    //         <LinkContainer
    //             to={{
    //               pathname: `/project/${project.name}/edit/${issue.id}`,
    //               state: { ...location.state, back: this.props.location },
    //             }}>
    //           <Button title="Edit issue" disabled={project.role < Role.UPDATER}>Edit</Button>
    //         </LinkContainer>
    //         <Button
    //             title="Delete issue" bsStyle="default"
    //             disabled={project.role < Role.MANAGER}
    //             onClick={this.onDeleteIssue}>Delete</Button>
    //       </ButtonGroup>
    //       <ButtonGroup className="issue-nav">
    //         <LinkContainer
    //             to={{ ...location, pathname: `/project/${project.name}/issues/${prevIssue}` }}
    //             disabled={prevIssue === null}>
    //           <Button title="Previous issue">
    //             <ArrowBackIcon />
    //           </Button>
    //         </LinkContainer>
    //         <LinkContainer
    //             to={{ ...location, pathname: `/project/${project.name}/issues/${nextIssue}` }}
    //             disabled={nextIssue === null}>
    //           <Button title="Next issue">
    //             <ArrowForwardIcon />
    //           </Button>
    //         </LinkContainer>
    //       </ButtonGroup>
    //     </header>
    //     <section className="content">
    //       <div className="left">
    //         <table className="create-issue-table form-table">
    //           <tbody>
    //             <tr>
    //               <th className="header">State:</th>
    //               <td className="state">
    //                 {project.workflow.statesById.get(issue.state).caption}
    //               </td>
    //             </tr>
    //             {issue.summary.length > 0 && (
    //               <tr>
    //                 <th className="header">Summary:</th>
    //                 <td>{issue.summary}</td>
    //               </tr>
    //             )}
    //             {issue.description.length > 0 && (
    //               <tr>
    //                 <th className="header">Description:</th>
    //                 {this.renderDescription(issue.description)}
    //               </tr>
    //             )}
    //             <tr>
    //               <th className="header">Created:</th>
    //               <td className="changes">
    //                 <RelativeDate date={new Date(issue.created)} />
    //               </td>
    //             </tr>
    //             <tr>
    //               <th className="header">Reporter:</th>
    //               <td className="reporter">
    //                 {issue.reporter
    //                   ? <UserName user={issue.reporter} full />
    //                   : <span className="unassigned">unassigned</span>}
    //               </td>
    //             </tr>
    //             <tr>
    //               <th className="header">Owner:</th>
    //               <td>
    //                 {issue.owner
    //                   ? <UserName user={issue.owner} full />
    //                   : <span className="unassigned">unassigned</span>}
    //               </td>
    //             </tr>
    //             {issue.cc.length > 0 && (
    //               <tr>
    //                 <th className="header">CC:</th>
    //                 <td>{issue.cc.map(cc => <UserName user={cc} key={cc} full />)}
    //                 </td>
    //               </tr>
    //             )}
    //             {this.renderTemplateFields(issueType, custom)}
    //             {labels.length > 0 && (
    //               <tr>
    //                 <th className="header labels">Labels:</th>
    //                 <td>
    //                   {labels.map(label =>
    //                     <LabelName label={label} project={project.id} key={label} />)}
    //                 </td>
    //               </tr>
    //             )}
    //             {attachmentsData.length > 0 && (
    //               <tr>
    //                 <th className="header">Attachments:</th>
    //                 <td><ShowAttachments attachments={attachmentsData} /></td>
    //               </tr>
    //             )}
    //             {linked.length > 0 && <tr>
    //               <th className="header linked">Linked Issues:</th>
    //               <td>
    //                 <IssueLinks
    //                     project={project}
    //                     links={linked}
    //                     onRemoveLink={this.onRemoveIssueLink} />
    //               </td>
    //             </tr>}
    //             {((comments || []).length > 0 || (changes || []).length > 0) && <tr>
    //               <th className="header history">Issue History:</th>
    //               <td>
    //                 <IssueChanges
    //                     issue={issue} comments={comments} changes={changes}
    //                     project={project} onAddComment={this.onAddComment} />
    //               </td>
    //             </tr>}
    //             <tr>
    //               <th className="header" />
    //               <td>
//                 <CommentEdit issue={issue} project={project} onAddComment={this.onAddComment} />
    //               </td>
    //             </tr>
    //           </tbody>
    //         </table>
    //       </div>
    //       {project.role >= Role.UPDATER && (<aside className="right">
    //         <WorkflowActions
    //             project={project}
    //             state={issue.state}
    //             issue={issue}
    //             onExecAction={this.onExecAction} />
    //       </aside>)}
    //     </section>
    //   </section>
    //   {showDelete && (<ConfirmDialog
    //       title="Are you sure you want to delete this issue?"
    //       confirmText="Delete"
    //       cancelText="Cancel"
    //       onConfirm={this.onConfirmDelete}
    //       onCancel={this.onCancelDelete}
    //       busy={busyDelete}>
    //     This action cannot be undone.
    //   </ConfirmDialog>)}
    // </section>);
    return (
      <section className="kdt issue-details">
        Issue Details
      </section>
    );
  }
}

// IssueDetails.propTypes = {
//   data: PropTypes.shape({
//     error: PropTypes.shape({}),
//     issue: PropTypes.shape({
//       id: PropTypes.number.isRequired,
//     }),
//     loading: PropTypes.bool,
//     refetch: PropTypes.func.isRequired,
//   }),
//   params: PropTypes.shape({
//     id: PropTypes.string.isRequired,
//   }),
//   project: PropTypes.shape({
//     name: PropTypes.string.isRequired,
//     role: PropTypes.number.isRequired,
//   }),
//   location: PropTypes.shape({
//     pathname: PropTypes.string.isRequired,
//     state: PropTypes.shape({
//       idList: PropTypes.arrayOf(PropTypes.number),
//     }),
//   }).isRequired,
// };
//
// export default graphql(IssueDetailsQuery, {
//   options: ({ project, params }) => ({
//     variables: { project: project.id, id: parseInt(params.id, 10) },
//     fragments: [IssueContent],
//   }),
// })(IssueDetails);

export default IssueDetails;
