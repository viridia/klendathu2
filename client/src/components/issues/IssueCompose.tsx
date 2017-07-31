// tslint:disable:jsx-no-lambda
import { LinkedIssue, Project, Relation, Template, User, Workflow } from 'common/api';
import * as Immutable from 'immutable';
import * as PropTypes from 'prop-types';
import * as React from 'react';
import { Button, Checkbox, ControlLabel, FormControl } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import {
  RouteComponentProps,
} from 'react-router-dom';
// import DropdownButton from 'react-bootstrap/lib/DropdownButton';
// import MenuItem from 'react-bootstrap/lib/MenuItem';
// import IssueAutoComplete from './issueAutocomplete.jsx';
// import LabelSelector from './labelSelector.jsx';
// import CustomEnumField from './customEnumField.jsx';
// import CustomSuggestField from './customSuggestField.jsx';
// import CommentEdit from './commentEdit.jsx';
// import LinkedIssues from './linkedIssues.jsx';
// import UploadAttachments from '../files/uploadAttachments.jsx';
import autobind from '../../lib/autobind';
import '../common/card.scss';
import '../common/form.scss';
import UserAutocomplete from '../common/UserAutocomplete';
import LabelSelector from './input/LabelSelector';
import StateSelector from './input/StateSelector';
import TypeSelector from './input/TypeSelector';
import './IssueCompose.scss';

interface Props extends RouteComponentProps<{}> {
  issue?: { id: number; };
  onSave: (issueId: number, issue: string) => void;
  project: Project;
  template: Template;
  workflow: Workflow;
}

interface State {
  prevState?: string;
  issueState: string;
  type: string;
  summary: string;
  summaryError: string;
  description: string;
  descriptionError: string;
  public: boolean;
  // reporter: this.me,
  owner?: User;
  cc: User[];
  labels: number[];
  linkedIssue?: LinkedIssue;
  linkedIssueMap: Immutable.OrderedMap<number, LinkedIssue>;
  relation: Relation;
  custom: Immutable.Map<string, string>;
  commentText: string;
  comments: any[];
  another: boolean;
}

export default class IssueCompose extends React.Component<Props, State> {
  public static contextTypes = {
    profile: PropTypes.shape({
      username: PropTypes.string.isRequired,
    }),
  };

  private form: HTMLFormElement;

  constructor(props: Props, context: any) {
    super(props, context);
  //   this.me = { id: context.profile.username, label: context.profile.username };
    this.state = {
      prevState: null,
      issueState: 'new',
      type: '',
      summary: '',
      summaryError: '',
      description: '',
      descriptionError: '',
      public: false,
      // reporter: this.me,
      owner: null,
      cc: [],
      labels: [],
      linkedIssue: null,
      linkedIssueMap: Immutable.OrderedMap(),
      relation: Relation.BLOCKED_BY,
      custom: Immutable.Map.of(),
      commentText: '',
      comments: [],
      another: false,
    };
  //   this.buildLinkedIssueList(this.state.linkedIssueMap);
  }

  // componentDidMount() {
  //   this.reset();
  // }
  //
  // componentWillUpdate(nextProps, nextState) {
  //   const thisId = this.props.issue && this.props.issue.id;
  //   const nextId = nextProps.issue && nextProps.issue.id;
  //   if (thisId !== nextId) {
  //     this.reset();
  //   }
  //   this.buildLinkedIssueList(nextState.linkedIssueMap);
  // }

  public render() {
    const { project, issue, location } = this.props;
    // console.log(project, issue, location);
    const backLink = (location.state && location.state.back) || { pathname: '..' };
    const canSave = this.state.summary && !this.state.linkedIssue;
    // return (<section className="kdt issue-compose">
    //               <tr>
    //                 <th className="header"><ControlLabel>Attach files:</ControlLabel></th>
    //                 <td>
//                   <UploadAttachments ref={el => { this.attachments = el; }} project={project} />
    //                 </td>
    //               </tr>
    //               <tr>
    //                 <th className="header"><ControlLabel>Linked Issues:</ControlLabel></th>
    //                 <td>
    //                   <LinkedIssues
    //                       project={project}
    //                       links={this.linkedIssueList}
    //                       onRemoveLink={this.onRemoveLinkedIssue} />
    //                   <div className="linked-group">
    //                     <DropdownButton
    //                         bsSize="small"
    //                         title={Relation.caption[this.state.relation]}
    //                         id="issue-link-type"
    //                         onSelect={this.onChangeRelation}>
    //                       {Relation.values.map(r => (<MenuItem
    //                           eventKey={r}
    //                           key={r}
//                           active={r === this.state.relation}>{Relation.caption[r]}</MenuItem>))}
    //                     </DropdownButton>
    //                     <div className="ac-shim">
    //                       <IssueAutoComplete
    //                           className="ac-issue"
    //                           project={project}
    //                           placeholder="select an issue..."
    //                           exclude={issue && issue.id}
    //                           selection={this.state.linkedIssue}
    //                           onSelectionChange={this.onChangeLinkedIssue}
    //                           onEnter={this.onAddLinkedIssue} />
    //                     </div>
    //                     <Button
    //                         bsSize="small"
    //                         onClick={this.onAddLinkedIssue}
    //                         disabled={!this.state.linkedIssue}>Add</Button>
    //                   </div>
    //                 </td>
    //               </tr>
    //               <tr>
    //                 <th className="header"><ControlLabel>Comments:</ControlLabel></th>
    //                 <td>
    //                   <CommentEdit
    //                       issue={issue} project={project} comments={this.state.comments}
    //                       onAddComment={this.onAddComment} />
    //                 </td>
    //               </tr>
    //             </tbody>
    //           </table>
    //         </form>
    //       </div>
    //     </section>
    //   </div>
    // </section>);
    return (
      <section className="kdt issue-compose">
        <div className="card">
          <header>
            {issue
              ? <span>Edit Issue #{issue.id}</span>
              : <span>New Issue: {project.name}</span>}
          </header>
          <section className="content create-issue">
            <div className="left">
              <form ref={el => { this.form = el; }} name="lastpass-disable-search">
                <table className="create-issue-table form-table">
                  <tbody>
                    <tr>
                      <th className="header"><ControlLabel>Issue Type:</ControlLabel></th>
                      <td>
                        <TypeSelector
                            value={this.state.type}
                            template={this.props.template}
                            onChange={this.onChangeType}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th className="header"><ControlLabel>Summary:</ControlLabel></th>
                      <td>
                        <FormControl
                            className="summary"
                            type="text"
                            value={this.state.summary}
                            placeholder="one-line summary of this issue"
                            onChange={this.onChangeSummary}
                            onKeyDown={this.onInputKeyDown}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th className="header"><ControlLabel>Description:</ControlLabel></th>
                      <td>
                        <FormControl
                            className="description"
                            componentClass="textarea"
                            value={this.state.description}
                            placeholder="description of this issue (markdown format supported)"
                            onChange={this.onChangeDescription}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th className="header"><ControlLabel>Reporter:</ControlLabel></th>
                      <td className="reporter single-static">
                        <span>{this.context.profile.username}</span>
                      </td>
                    </tr>
                    <tr>
                      <th className="header"><ControlLabel>Assign to:</ControlLabel></th>
                      <td>
                        <UserAutocomplete
                            className="assignee ac-single"
                            project={project}
                            placeholder="(unassigned)"
                            selection={this.state.owner}
                            onSelectionChange={this.onChangeOwner}
                            onEnter={this.onFocusNext}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th className="header"><ControlLabel>CC:</ControlLabel></th>
                      <td>
                        <div className="ac-multi-group">
                          <UserAutocomplete
                              className="assignee ac-multi"
                              project={project}
                              multiple={true}
                              selection={this.state.cc}
                              onSelectionChange={this.onChangeCC}
                              onEnter={this.onFocusNext}
                          />
                        </div>
                      </td>
                    </tr>
                    {this.renderTemplateFields()}
                    <tr>
                      <th className="header"><ControlLabel>Labels:</ControlLabel></th>
                      <td>
                        <div className="ac-multi-group">
                          <LabelSelector
                              id="labels"
                              className="labels ac-multi"
                              project={project}
                              selection={this.state.labels}
                              onSelectionChange={this.onChangeLabels}
                              onEnter={this.onFocusNext}
                          />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </form>
            </div>
            <aside className="right">
              <StateSelector
                  project={project}
                  workflow={this.props.workflow}
                  state={this.state.issueState}
                  prevState={this.state.prevState}
                  onStateChanged={this.onChangeState}
              />
              {project.isPublic && <ControlLabel>Visbility</ControlLabel>}
              {project.isPublic &&
                (<Checkbox checked={this.state.public} onChange={this.onChangePublic}>
                  Public
                </Checkbox>)}
            </aside>
          </section>
          <footer className="submit-buttons">
            {!issue && (<Checkbox checked={this.state.another} onChange={this.onChangeAnother}>
              Create another
            </Checkbox>)}
            <LinkContainer to={backLink}>
              <Button>Cancel</Button>
            </LinkContainer>
            {issue ? (
              <Button bsStyle="primary" disabled={!canSave} onClick={this.onCreate}>
                Save
              </Button>
            ) : (
              <Button bsStyle="primary" disabled={!canSave} onClick={this.onCreate}>
                Create
              </Button>
            )}
          </footer>
        </div>
      </section>
    );
  }

  private renderTemplateFields(): JSX.Element[] {
    // const { project } = this.props;
    // const issueType = project.template.typesById.get(this.state.type);
    // const result = [];
    // if (issueType) {
    //   return this.renderCustomFields(issueType, result);
    // }
    // return result;
    return [];
  }

  // renderCustomFields(issueType, result) {
  //   const { project } = this.props;
  //   const fields = this.customFieldList(issueType);
  //   for (const field of fields) {
  //     let component = null;
  //     const value = this.state.custom.get(field.id) || field.default || '';
  //     switch (field.type) {
  //       case 'TEXT':
  //         component = (<CustomSuggestField
  //             value={value}
  //             field={field}
  //             project={project}
  //             onChange={this.onChangeCustomField}
  //             onEnter={this.onFocusNext} />);
  //         break;
  //       case 'ENUM':
  //         component = (<CustomEnumField
  //             value={value}
  //             field={field}
  //             onChange={this.onChangeCustomField} />);
  //         break;
  //       default:
  //         console.error('invalid field type:', field.type);
  //         break;
  //     }
  //     if (component) {
  //       result.push(<tr key={field.id}>
  //         <th>{field.caption}:</th>
  //         <td>{component}</td>
  //       </tr>);
  //     }
  //   }
  //   return result;
  // }
  //
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

  @autobind
  private onInputKeyDown(e: any) {
    if (e.keyCode === 13) { // ENTER
      e.preventDefault();
      this.onFocusNext();
    }
  }

  private onFocusNext() {
    this.navigate(1);
  }

  // private onFocusPrev() {
  //   this.navigate(-1);
  // }

  @autobind
  private onChangeType(value: string) {
    this.setState({ type: value });
  }

  @autobind
  private onChangeState(st: string) {
    this.setState({ issueState: st });
  }

  @autobind
  private onChangeSummary(e: any) {
    // TODO: validate length
    this.setState({ summary: e.target.value });
  }

  @autobind
  private onChangeDescription(e: any) {
    // TODO: validate length
    this.setState({ description: e.target.value });
  }

  // onChangeReporter(e) {
  //   this.setState({ reporter: e });
  // }

  @autobind
  private onChangeOwner(selection: User) {
    this.setState({ owner: selection });
  }

  @autobind
  private onChangeCC(selection: User[]) {
    this.setState({ cc: selection });
  }

  @autobind
  private onChangeLabels(selection: number[]) {
    this.setState({ labels: selection });
  }

  // onChangeLinkedIssue(selection) {
  //   this.setState({ linkedIssue: selection });
  // }
  //
  // onChangeRelation(selection) {
  //   this.setState({ relation: selection });
  // }
  //
  // onChangeCustomField(id, value) {
  //   this.setState({ custom: this.state.custom.set(id, value) });
  // }

  @autobind
  private onChangePublic(e: any) {
    this.setState({ public: e.target.checked });
  }

  @autobind
  private onChangeAnother(e: any) {
    this.setState({ another: e.target.checked });
  }

  // onChangeCommentText(e) {
  //   this.setState({ commentText: e.target.value });
  // }
  //
  // onAddComment(commentText) {
  //   const newComment = {
  //     author: this.context.profile.username,
  //     body: commentText,
  //   };
  //   this.setState({
  //     comments: this.state.comments.concat([newComment]),
  //     commentText: '',
  //   });
  //   return Promise.resolve(newComment);
  // }
  //
  // onAddLinkedIssue(e) {
  //   if (e) {
  //     e.preventDefault();
  //   }
  //   const { relation, linkedIssue } = this.state;
  //   if (relation && linkedIssue) {
  //     // Can't link an issue to itself.
  //     if (this.props.issue && linkedIssue.id === this.props.issue.id) {
  //       return;
  //     }
  //     this.setState({
  //       linkedIssueMap: this.state.linkedIssueMap.set(linkedIssue.id, relation),
  //       linkedIssue: null,
  //     });
  //   }
  // }
  //
  // onRemoveLinkedIssue(id) {
  //   this.setState({ linkedIssueMap: this.state.linkedIssueMap.remove(id) });
  // }

  @autobind
  private onCreate() {
  //   this.buildLinkedIssueList(this.state.linkedIssueMap);
  //   const issue = {
  //     state: this.state.issueState,
  //     type: this.state.type,
  //     summary: this.state.summary,
  //     description: this.state.description,
  //     owner: this.state.owner ? this.state.owner.username : undefined,
  //     cc: this.state.cc.map(cc => cc.username),
  //     labels: this.state.labels.map(label => label.id),
  //     linked: this.linkedIssueList,
  //     attachments: this.attachments.files(),
  //     custom: [],
  //     public: this.state.public,
  //     // comments
  //   };
  //   const { project } = this.props;
  //   const issueType = project.template.typesById.get(issue.type);
  //   const fields = this.customFieldList(issueType);
  //   for (const field of fields) {
  //     const fieldValue = this.state.custom.get(field.id) || field.default;
  //     if (fieldValue) {
  //       issue.custom.push({
  //         name: field.id,
  //         value: fieldValue,
  //       });
  //     }
  //   }
// return this.props.onSave(this.props.issue ? this.props.issue.id : undefined, issue).then(() => {
  //     this.reset();
  //     if (!this.props.issue && !this.state.another) {
  //       const { location } = this.props;
  //       const back = (location.state && location.state.back) || { pathname: '..' };
  //       browserHistory.push(back);
  //     }
  //   });
  }

  // reset() {
  //   const { project, issue } = this.props;
  //   const concreteTypes = project.template.types.filter(t => !t.abstract);
  //   if (issue) {
  //     const linked = issue.linked || [];
  //     this.setState({
  //       prevState: issue.state,
  //       issueState: issue.state,
  //       type: issue.type,
  //       summary: issue.summary,
  //       description: issue.description,
  //       reporter: issue.reporter,
  //       owner: issue.ownerData,
  //       cc: issue.ccData,
  //       custom: issue.custom
  //           ? new Immutable.Map(issue.custom.map(custom => [custom.name, custom.value]))
  //           : Immutable.Map.of(),
  //       labels: issue.labelsData,
  //       linkedIssue: null,
//       linkedIssueMap: new Immutable.OrderedMap(linked.map(({ relation, to }) => [to, relation])),
  //       relation: Relation.BLOCKED_BY,
  //       comments: issue.comments,
  //       public: !!issue.public,
  //     });
  //     this.attachments.setFiles(issue.attachmentsData || []);
  //   } else {
  //     const { start = ['new'] } = project.workflow;
  //     this.setState({
  //       prevState: null,
  //       issueState: start[0],
  //       // If current type is valid then keep it, otherwise default to the first type.
  //       type: project.template.typesById.has(this.state.type)
  //           ? this.state.type : concreteTypes[0].id,
  //       summary: '',
  //       description: '',
  //       reporter: this.me,
  //       owner: null,
  //       cc: [],
  //       custom: Immutable.Map.of(),
  //       labels: [],
  //       comments: [],
  //       linkedIssue: null,
  //       linkedIssueMap: Immutable.OrderedMap.of(),
  //       relation: Relation.BLOCKED_BY,
  //       public: !!project.public,
  //     });
  //     this.attachments.setFiles([]);
  //   }
  // }
  //
  // buildLinkedIssueList(linkedIssueMap) {
  //   this.linkedIssueList = linkedIssueMap.map((relation, to) =>
  //       ({ relation, to })).toArray();
  // }

  private navigate(dir: number) {
    const activeEl = document.activeElement;
    let activeIndex = -1;
    for (let i = 0; i < this.form.elements.length; i += 1) {
      if (this.form.elements[i] === activeEl) {
        activeIndex = i;
        break;
      }
    }
    activeIndex += dir;
    if (activeIndex < 0) {
      activeIndex = this.form.elements.length - 1;
    } else if (activeIndex >= this.form.elements.length) {
      activeIndex = 0;
    }
    const nextActive = this.form.elements[activeIndex] as HTMLFormElement;
    if (nextActive) {
      nextActive.focus();
    }
  }
}
