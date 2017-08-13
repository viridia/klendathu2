import autobind from 'bind-decorator';
import {
  DataType,
  FieldType,
  Issue,
  IssueInput,
  IssueType,
  Project,
  Relation,
  Template,
  User,
  Workflow,
} from 'common/api';
import * as Immutable from 'immutable';
import * as PropTypes from 'prop-types';
import * as React from 'react';
import {
  Button, Checkbox, ControlLabel, DropdownButton, FormControl, MenuItem,
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { caption } from '../../lib/relation';
import '../common/card.scss';
import '../common/form.scss';
import UserAutocomplete from '../common/UserAutocomplete';
import UploadAttachments from '../files/UploadAttachments';
import CommentEdit from './input/CommentEdit';
import CustomEnumField from './input/CustomEnumField';
import CustomSuggestField from './input/CustomSuggestField';
import IssueAutoComplete from './input/IssueAutocomplete';
import LabelSelector from './input/LabelSelector';
import StateSelector from './input/StateSelector';
import TypeSelector from './input/TypeSelector';
import './IssueCompose.scss';
import IssueLinks from './IssueLinks';

type IssueLinkMap = Immutable.OrderedMap<number, Relation>;

interface Props extends RouteComponentProps<{}> {
  issue?: Issue;
  onSave: (issueId: number, issue: IssueInput) => Promise<any>;
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
  isPublic: boolean;
  owner?: User;
  cc: User[];
  labels: number[];
  issueToLink?: Issue;
  issueLinkMap: IssueLinkMap;
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
  private attachments: UploadAttachments;

  constructor(props: Props, context: any) {
    super(props, context);
    this.state = {
      prevState: null,
      issueState: 'new',
      type: '',
      summary: '',
      summaryError: '',
      description: '',
      descriptionError: '',
      isPublic: false,
      owner: null,
      cc: [],
      labels: [],
      issueToLink: null,
      issueLinkMap: Immutable.OrderedMap(),
      relation: Relation.BLOCKED_BY,
      custom: Immutable.Map.of(),
      commentText: '',
      comments: [],
      another: false,
    };
  }

  public componentDidMount() {
    this.reset();
  }

  public componentWillUpdate(nextProps: Props, nextState: State) {
    const thisId = this.props.issue && this.props.issue.id;
    const nextId = nextProps.issue && nextProps.issue.id;
    if (thisId !== nextId) {
      this.reset();
    }
  }

  public render() {
    const { project, issue, location } = this.props;
    const backLink = (location.state && location.state.back) || { pathname: '..' };
    const canSave = this.state.summary && !this.state.issueToLink;
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
                    <tr>
                      <th className="header"><ControlLabel>Attach files:</ControlLabel></th>
                      <td>
                        <UploadAttachments
                          ref={el => { this.attachments = el; }}
                          project={project}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th className="header"><ControlLabel>Linked Issues:</ControlLabel></th>
                      <td>
                        <IssueLinks
                            project={project}
                            links={this.state.issueLinkMap}
                            onRemoveLink={this.onRemoveIssueLink}
                        />
                        <div className="linked-group">
                          <DropdownButton
                              bsSize="small"
                              title={caption[this.state.relation]}
                              id="issue-link-type"
                              onSelect={this.onChangeRelation}
                          >
                            {Relation.values.map(r => (
                              <MenuItem
                                  eventKey={r}
                                  key={r}
                                  active={r === this.state.relation}
                              >
                                {caption[r]}
                              </MenuItem>))}
                          </DropdownButton>
                          <div className="ac-shim">
                            <IssueAutoComplete
                                className="ac-issue"
                                project={project}
                                placeholder="select an issue..."
                                exclude={issue && issue.id}
                                selection={this.state.issueToLink}
                                onSelectionChange={this.onChangeIssueToLink}
                                onEnter={this.onAddIssueLink}
                            />
                          </div>
                          <Button
                              bsSize="small"
                              onClick={this.onAddIssueLink}
                              disabled={!this.state.issueToLink}
                          >
                            Add
                          </Button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th className="header"><ControlLabel>Comments:</ControlLabel></th>
                      <td>
                        <CommentEdit
                            project={project}
                            onAddComment={this.onAddComment}
                        />
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
                (<Checkbox checked={this.state.isPublic} onChange={this.onChangePublic}>
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
    const issueType = this.getIssueType(this.state.type);
    const result: JSX.Element[] = [];
    if (issueType) {
      return this.renderCustomFields(issueType, result);
    }
    return result;
  }

  private renderCustomFields(issueType: IssueType, result: JSX.Element[]) {
    const { project } = this.props;
    const fields = this.customFieldList(issueType);
    for (const field of fields) {
      let component = null;
      const value = this.state.custom.get(field.id) || field.default || '';
      switch (field.type) {
        case DataType.TEXT:
          component = (
            <CustomSuggestField
                value={value}
                field={field}
                project={project}
                onChange={this.onChangeCustomField}
                onEnter={this.onFocusNext}
            />
          );
          break;
        case DataType.ENUM:
          component = (
            <CustomEnumField
                value={value}
                field={field}
                onChange={this.onChangeCustomField}
            />
          );
          break;
        default:
          console.error('invalid field type:', field.type);
          break;
      }
      if (component) {
        result.push(
          <tr key={field.id}>
            <th>{field.caption}:</th>
            <td>{component}</td>
          </tr>);
      }
    }
    return result;
  }

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

  @autobind
  private onChangeIssueToLink(selection: Issue) {
    this.setState({ issueToLink: selection });
  }

  @autobind
  private onChangeRelation(selection: any) {
    this.setState({ relation: selection as Relation });
  }

  @autobind
  private onChangeCustomField(id: string, value: any) {
    this.setState({ custom: this.state.custom.set(id, value) });
  }

  @autobind
  private onChangePublic(e: any) {
    this.setState({ isPublic: e.target.checked });
  }

  @autobind
  private onChangeAnother(e: any) {
    this.setState({ another: e.target.checked });
  }

  @autobind
  private onAddComment(commentText: string) {
    const newComment = {
      author: this.context.profile.username,
      body: commentText,
    };
    this.setState({
      comments: this.state.comments.concat([newComment]),
      commentText: '',
    });
    return Promise.resolve(newComment);
  }

  @autobind
  private onAddIssueLink() {
    const { relation, issueToLink } = this.state;
    if (relation && issueToLink) {
      // Can't link an issue to itself.
      if (this.props.issue && issueToLink.id === this.props.issue.id) {
        return;
      }
      this.setState({
        issueLinkMap: this.state.issueLinkMap.set(issueToLink.id, relation),
        issueToLink: null,
      });
    }
  }

  @autobind
  private onRemoveIssueLink(id: number) {
    this.setState({ issueLinkMap: this.state.issueLinkMap.remove(id) });
  }

  @autobind
  private onCreate() {
    const issue: IssueInput = {
      state: this.state.issueState,
      type: this.state.type,
      summary: this.state.summary,
      description: this.state.description,
      owner: this.state.owner ? this.state.owner.username : undefined,
      cc: this.state.cc.map(cc => cc.username),
      labels: this.state.labels,
      linked: this.state.issueLinkMap.map((relation, to) => ({ to, relation })).toArray(),
      attachments: this.attachments.files(),
      custom: [],
      isPublic: this.state.isPublic,
      comments: this.state.comments,
    };
    const { template } = this.props;
    const issueType = template.types.find(type => type.id === issue.type);
    const fields = this.customFieldList(issueType);
    for (const field of fields) {
      const fieldValue = this.state.custom.get(field.id) || field.default;
      if (fieldValue) {
        issue.custom.push({
          name: field.id,
          value: fieldValue,
        });
      }
    }
    return this.props.onSave(this.props.issue ? this.props.issue.id : undefined, issue).then(() => {
      this.reset();
      if (!this.props.issue && !this.state.another) {
        const { location } = this.props;
        const back = (location.state && location.state.back) || { pathname: '..' };
        this.props.history.push(back);
      }
    });
  }

  private reset() {
    const { project, issue, workflow, template } = this.props;
    const concreteTypes = template.types.filter(t => !t.abstract);
    if (issue) {
      const linked = issue.linked || [];
      this.setState({
        prevState: issue.state,
        issueState: issue.state,
        type: issue.type,
        summary: issue.summary,
        description: issue.description,
        // TODO: finish
        // owner: issue.owner,
  //       owner: issue.ownerData,
  //       cc: issue.ccData,
        custom: issue.custom
            ? Immutable.Map(issue.custom.map(custom => [custom.name, custom.value]))
            : Immutable.Map.of(),
        labels: issue.labels,
        issueToLink: null,
        issueLinkMap: Immutable.OrderedMap<number, Relation>(
            linked.map(({ relation, to }) => ([to, relation] as [number, Relation]))),
        relation: Relation.BLOCKED_BY,
        comments: issue.comments,
        isPublic: !!issue.isPublic,
      });
      this.attachments.setFiles(issue.attachments || []);
    } else {
      const { start = ['new'] } = workflow;
      this.setState({
        prevState: null,
        issueState: start[0],
        // If current type is valid then keep it, otherwise default to the first type.
        type: template.types.find(type => type.id === this.state.type)
            ? this.state.type : concreteTypes[0].id,
        summary: '',
        description: '',
        owner: null,
        cc: [],
        custom: Immutable.Map.of(),
        labels: [],
        comments: [],
        issueToLink: null,
        issueLinkMap: Immutable.OrderedMap<number, Relation>(),
        relation: Relation.BLOCKED_BY,
        isPublic: !!project.isPublic,
      });
      this.attachments.setFiles([]);
    }
  }

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
