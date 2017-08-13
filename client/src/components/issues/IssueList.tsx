import autobind from 'bind-decorator';
import * as classNames from 'classnames';
import {
  Issue,
  Project,
  Role,
  Template,
} from 'common/api';
import * as Immutable from 'immutable';
import * as qs from 'qs';
import * as React from 'react';
import { Checkbox, Dropdown, MenuItem } from 'react-bootstrap';
import { connect } from 'react-redux';
import { NavLink, RouteComponentProps } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { clearSelection, deselectIssues, selectIssues } from '../../store/actions';
import ColumnSort from '../common/ColumnSort';
import LabelName from '../common/LabelName';
import ColumnRenderer from './columns/ColumnRenderer';
import CustomColumnRenderer from './columns/CustomColumnRenderer';
import DateColumnRenderer from './columns/DateColumnRenderer';
import TextColumnRenderer from './columns/TextColumnRenderer';
import TypeColumnRenderer from './columns/TypeColumnRenderer';
import UserColumnRenderer from './columns/UserColumnRenderer';

import MenuIcon from 'icons/ic_menu_black_24px.svg';

import '../common/card.scss';
import './IssueList.scss';

interface OwnProps extends RouteComponentProps<{}> {
  loading: boolean;
  project: Project;
  template: Template;
  issues: Issue[];
  labels: Immutable.Set<number>;
  columns: string[];
}

interface StateProps {
  selection: Immutable.Set<number>;
}

interface DispatchProps {
  clearSelection: () => void;
  selectIssues: (ids: number[]) => void;
  deselectIssues: (ids: number[]) => void;
}

type Props = StateProps & OwnProps & DispatchProps;

interface ColumnRendererMap {
  [name: string]: ColumnRenderer;
}

export type IssueIdSet = Immutable.Set<number>;
interface QueryParams { [param: string]: string; }

function parseQuery(search?: string): QueryParams {
  if (search) {
    return qs.parse(search.slice(1));
  } else {
    return {};
  }
}

class IssueList extends React.Component<Props> {
  private columnRenderers: ColumnRendererMap;
  private selectAll: HTMLInputElement;
  private issueIdSet: IssueIdSet;
  private issueIds: number[];
  private query: QueryParams;

  constructor(props: Props) {
    super(props);
    this.query = parseQuery(props.location.search);
    this.createColumnRenderers(props.template);
    this.buildIssueIdList(props);
  }

  public componentDidMount() {
    this.updateSelectAll();
  }

  public componentWillReceiveProps(nextProps: Props) {
    this.query = parseQuery(nextProps.location.search);
    this.createColumnRenderers(nextProps.template);
    this.buildIssueIdList(nextProps);
  }

  public shouldComponentUpdate(nextProps: Props) {
    return (
      this.props.loading !== nextProps.loading ||
      this.props.issues !== nextProps.issues ||
      this.props.project !== nextProps.project ||
      this.props.template !== nextProps.template ||
      this.props.location !== nextProps.location ||
      this.props.selection !== nextProps.selection ||
      this.props.columns !== nextProps.columns);
  }

  public componentDidUpdate() {
    this.updateSelectAll();
  }

  public render() {
    const { issues, loading } = this.props;
    if (!issues || issues.length === 0) {
      if (loading) {
        return null;
      }
      return (
        <div className="card report">
          <div className="no-issues">No issues found</div>
        </div>
      );
    }

    return (
      <div className="card report">
        <table className="issue">
          {this.renderHeader()}
          <tbody>{this.renderIssueList()}</tbody>
        </table>
      </div>
    );
  }

  private renderIssueList() {
    const { issues } = this.props;
    if (this.query.subtasks !== undefined) {
      const childMap = new Map();
      const topLevel = [];
      for (const issue of issues) {
        if (issue.parent) {
          if (!childMap.has(issue.parent)) {
            childMap.set(issue.parent, []);
          }
          childMap.get(issue.parent).push(issue);
        } else {
          topLevel.push(issue);
        }
      }
      // return topLevel.map(i => this.renderIssue(i));
      const issueList: JSX.Element[] = [];
      const renderChildren = (issue: Issue, level: number) => {
        if (childMap.has(issue.id)) {
          for (const child of childMap.get(issue.id)) {
            issueList.push(this.renderIssue(child, level));
            renderChildren(child, level + 1);
          }
        }
      };
      for (const issue of topLevel) {
        issueList.push(this.renderIssue(issue, 0));
        renderChildren(issue, 1);
      }
      return issueList;
    }

    return issues.map(i => this.renderIssue(i));
  }

  private renderIssue(issue: Issue, level: number = 0): JSX.Element {
    const { project, selection, labels, columns } = this.props;
    const linkTarget = {
      pathname: `/project/${project.name}/issues/${issue.id}`,
      state: {
        back: this.props.location,
        idList: this.issueIds,
      },
    };
    const issueId = `issue-${issue.id}`;
    const style: any = {};
    if (level > 0) {
      style.marginLeft = `${level * 32}px`;
    }
    return (
      <tr key={issue.id}>
        {project.role >= Role.UPDATER && (<td className="selected">
          <label htmlFor={issueId}>
            <Checkbox
                id={issueId}
                bsClass="cbox"
                data-id={issue.id}
                checked={selection.has(issue.id)}
                onChange={this.onChangeSelection}
            />
          </label>
        </td>)}
        <td className="id">
          <NavLink to={linkTarget}>{issue.id}</NavLink>
        </td>
        {columns.map(cname => {
          const cr = this.columnRenderers[cname];
          if (cr) {
            return cr.render(issue);
          }
          return <td className="custom" key={cname} />;
        })}
        <td className="title">
          <NavLink to={linkTarget} className={classNames({ child: level > 0 })} style={style}>
            <span className="summary">{issue.summary}</span>
            {issue.labels
              .filter(l => labels.has(l))
              .map(l => <LabelName project={project.id} label={l} key={l} />)}
          </NavLink>
        </td>
      </tr>);
  }

  private renderHeader() {
    const { selection, project, columns } = this.props;
    const sortOrder = this.query.sort || '-updated';
    const descending = sortOrder.startsWith('-');
    const sort = descending ? sortOrder.slice(1) : sortOrder;
    // const { sort, descending } = this.state;
    return (
      <thead>
        <tr className="heading">
          {project.role >= Role.UPDATER && (<th className="selected">
            <label htmlFor="all-issues">
              <Checkbox
                  id="all-issues"
                  bsClass="cbox"
                  checked={selection.size > 0}
                  inputRef={el => { this.selectAll = el; }}
                  onChange={this.onChangeSelectAll}
              />
            </label>
          </th>)}
          <th className="id">
            <ColumnSort
                column="id"
                sortKey={sort}
                descending={descending}
                onChangeSort={this.onChangeSort}
            >
              #
            </ColumnSort>
          </th>
          {columns.map(cname => {
            const cr = this.columnRenderers[cname];
            if (cr) {
              return cr.renderHeader(sort, descending, this.onChangeSort);
            }
            return <th className="custom center" key={cname}>--</th>;
          })}
          <th className="summary">
            <section>
              <ColumnSort
                  column="summary"
                  sortKey={sort}
                  descending={descending}
                  onChangeSort={this.onChangeSort}
              >
                Summary
              </ColumnSort>
              <Dropdown id="issue-menu" pullRight={true}>
                <Dropdown.Toggle noCaret={true}>
                  <MenuIcon />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <MenuItem
                      className={classNames({ checked: !!this.query.subtasks })}
                      onClick={this.onToggleSubtasks}
                  >
                    Show Subtasks
                  </MenuItem>
                  <MenuItem disabled={true}>Arrange Columns&hellip;</MenuItem>
                </Dropdown.Menu>
              </Dropdown>
            </section>
          </th>
        </tr>
      </thead>
    );
  }

  @autobind
  private onChangeSelection(e: any) {
    const id = parseInt(e.target.dataset.id, 10);
    if (e.target.checked) {
      this.props.selectIssues([id]);
    } else {
      this.props.deselectIssues([id]);
    }
  }

  @autobind
  private onChangeSelectAll(e: any) {
    if (e.target.checked) {
      this.props.selectIssues(this.issueIds);
    } else {
      this.props.clearSelection();
    }
  }

  @autobind
  private onChangeSort(column: string, descending: boolean) {
    const { history } = this.props;
    const sort = `${descending ? '-' : ''}${column}`;
    history.replace({ ...this.props.location, search: qs.stringify({ ...this.query, sort }) });
  }

  @autobind
  private onToggleSubtasks() {
    const { history } = this.props;
    if (this.query.subtasks === undefined) {
      history.replace({
        ...this.props.location,
        search: qs.stringify({ ...this.query, subtasks: true }),
      });
    } else {
      // Remove 'subtasks' parameter from query.
      const { subtasks, ...newQuery } = this.query;
      history.replace({
        ...this.props.location,
        search: qs.stringify({ ...newQuery }),
      });
    }
  }

  private createColumnRenderers(template: Template) {
    this.columnRenderers = {
      state: new TextColumnRenderer('State', 'state', 'state pad'),
      reporter: new UserColumnRenderer('Reporter', 'reporter', 'reporter pad'),
      owner: new UserColumnRenderer('Owner', 'owner', 'owner pad'),
      created: new DateColumnRenderer('Created', 'created', 'created pad'),
      updated: new DateColumnRenderer('Updated', 'updated', 'updated pad'),
    };
    if (template) {
      this.columnRenderers.type = new TypeColumnRenderer(template);
      for (const type of template.types) {
        if (type.fields) {
          for (const field of type.fields) {
            this.columnRenderers[`custom.${field.id}`] = new CustomColumnRenderer(field);
          }
        }
      }
    }
  }

  private buildIssueIdList(props: Props) {
    const { issues } = props;
    this.issueIds = issues ? issues.map(i => i.id) : [];
    this.issueIdSet = Immutable.Set<number>(this.issueIds);
  }

  // Checkbox 'indeterminate' state can only be set programmatically.
  private updateSelectAll() {
    const { selection } = this.props;
    if (this.selectAll) {
      const noneSelected = selection.size === 0;
      const allSelected = this.issueIdSet.isSubset(selection);
      this.selectAll.indeterminate = !allSelected && !noneSelected;
    }
  }
}

export default connect<StateProps, DispatchProps, OwnProps>(
  state => ({
    selection: state.issueSelection,
  }),
  dispatch =>
    bindActionCreators({ clearSelection, selectIssues, deselectIssues }, dispatch),
)(IssueList);
