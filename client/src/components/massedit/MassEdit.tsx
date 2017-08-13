import autobind from 'bind-decorator';
import { Issue, Project, Template, Workflow } from 'common/api';
import * as Immutable from 'immutable';
import * as React from 'react';
import { Button, Collapse } from 'react-bootstrap';
import { connect } from 'react-redux';
import { deleteIssue, updateIssue } from '../../store/reducers/issue';
import MassAction from './MassAction';
import './MassEdit.scss';

interface OwnProps {
  project: Project;
  template: Template;
  workflow: Workflow;
  issues: Issue[];
}

interface StateProps {
  selection: Immutable.Set<number>;
}

type Props = OwnProps & StateProps;

interface State {
  expanded: boolean;
  actions: Immutable.List<any>; // TODO: Derive from location params
}

class MassEdit extends React.Component<Props, State> {
  constructor() {
    super();
    this.state = {
      expanded: true,
      actions: Immutable.List.of(), // TODO: Derive from location params
    };
  }

  public shouldComponentUpdate(nextProps: Props, nextState: State) {
    return this.props.project !== nextProps.project
        || this.props.issues !== nextProps.issues
        || this.props.selection !== nextProps.selection
        || this.state.expanded !== nextState.expanded
        || this.state.actions !== nextState.actions;
  }

  public render() {
    const { selection, project, template, workflow } = this.props;
    return (
      <Collapse in={selection.size > 0}>
        <section className="card mass-edit">
          <header className="filters">
            <div className="title">
              Mass Edit ({selection.size} issues selected)
            </div>
            <Button
                bsStyle="info"
                bsSize="small"
                disabled={this.state.actions.size === 0}
                onClick={this.onSave}
            >
              Save All Changes
            </Button>
          </header>
          <section className="action-list">
            {this.state.actions.map((action, index) => (
              <MassAction
                  index={index}
                  key={index}
                  action={action}
                  project={project}
                  template={template}
                  workflow={workflow}
                  onRemove={this.onRemoveAction}
                  onChange={this.onChangeAction}
              />))}
            <MassAction
                project={project}
                template={template}
                workflow={workflow}
                onRemove={this.onRemoveAction}
                onChange={this.onChangeAction}
            />
          </section>
        </section>
      </Collapse>);
  }

  @autobind
  private onChangeAction(index: number, action: any) {
    if (index !== undefined) {
      this.setState({ actions: this.state.actions.set(index, action) });
    } else {
      this.setState({ actions: this.state.actions.push(action) });
    }
  }

  @autobind
  private onRemoveAction(index: number) {
    this.setState({ actions: this.state.actions.remove(index) });
  }

  @autobind
  private onSave(e: any) {
    e.preventDefault();
    const { selection, issues, project } = this.props;
    const promises = [];
    for (const issue of issues) {
      let changed = false;
      let deleted = false;
      if (selection.has(issue.id)) {
        const updates = {};
        this.state.actions.forEach(action => {
          if (action.id === 'delete') {
            deleted = true;
          } else {
            changed = action.apply(issue, updates, action.value) || changed;
          }
        });
        if (deleted) {
          promises.push(deleteIssue(project.id, issue.id));
        } else if (changed) {
          promises.push(updateIssue(project.id, issue.id, updates));
        }
      }
    }
  }
}

export default connect<StateProps, undefined, OwnProps>(
  state => ({
    selection: state.issueSelection,
  }),
)(MassEdit);
