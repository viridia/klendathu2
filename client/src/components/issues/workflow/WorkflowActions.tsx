import { Issue, Workflow, WorkflowAction } from 'common/api';
import * as PropTypes from 'prop-types';
import * as React from 'react';
import { Button } from 'react-bootstrap';
import './WorkflowActions.scss';

interface Props {
  state: string;
  issue: Issue;
  workflow: Workflow;
  onExecAction: (a: ExecutableAction) => void;
}

interface ExecutableAction extends WorkflowAction {
  stateName?: string;
}

interface State {
  actions: ExecutableAction[];
}

export default class WorkflowActions extends React.Component<Props, State> {
  public static contextTypes = {
    profile: PropTypes.shape({
      username: PropTypes.string.isRequired,
    }),
  };

  constructor(props: Props, context: any) {
    super(props, context);
    this.state = {
      actions: this.buildActionTable(props),
    };
  }

  public componentWillReceiveProps(nextProps: Props) {
    this.setState({ actions: this.buildActionTable(nextProps) });
  }

  public shouldComponentUpdate(nextProps: Props) {
    return this.props.state !== nextProps.state || this.props.workflow !== nextProps.workflow;
  }

  public render() {
    return (
      <section className="wf-actions">
        {this.state.actions.map((a, index) => (<div className="wf-action" key={index}>
          <Button bsStyle="default" onClick={() => this.props.onExecAction(a)}>{a.caption}</Button>
          {a.state &&
            <div className="effect">state &rarr; <span className="value">{a.stateName}</span></div>}
          {a.owner &&
            <div className="effect">owner &rarr; <span className="value">{a.owner}</span></div>}
          {a.owner === null &&
            <div className="effect">owner &rarr; <span className="none">none</span></div>}
        </div>))}
      </section>
    );
  }

  /** Searches the issue for the owner prior to the current owner. */
  private findPreviousOwner(): string {
    const issue = this.props.issue;
    const owner = issue.owner;
    if (!issue.changes) {
      return undefined;
    }
    for (let i = issue.changes.length - 1; i >= 0; i -= 1) {
      const change = issue.changes[i];
      if (change.owner && change.owner.after !== owner) {
        return change.owner.after;
      }
    }
    return undefined;
  }

  /** Determine if the state transition for the action is a legal one. */
  private isLegalTransition(props: Props, action: WorkflowAction) {
    const { workflow, state } = props;
    const wfState = workflow.states.find(st => st.id === state);
    // Make sure the state we're transitioning to is acceptable.
    if (action.state && wfState.transitions.indexOf(action.state) < 0) {
      return false;
    }
    // Check if this action has a current state requirement.
    // console.log(JSON.stringify(action, null, 2));
    if (action.require && action.require.state) {
      if (action.require.state.indexOf(state) < 0) {
        return false;
      }
    }
    // Make sure the state we're going to is spelled correctly in the config.
    const toState = workflow.states.find(st => st.id === action.state);
    if (!toState) {
      return false;
    }
    return true;
  }

  private buildActionTable(props: Props) {
    const { workflow, issue } = props;
    if (!workflow.actions) {
      return [];
    }
    const actions: ExecutableAction[] = [];
    for (const action of workflow.actions) {
      if (this.isLegalTransition(props, action)) {
        const resolvedAction: ExecutableAction = {
          caption: action.caption,
        };
        if (action.state) {
          const toState = workflow.states.find(a => a.id === action.state);
          resolvedAction.state = action.state;
          resolvedAction.stateName = toState.caption;
        }
        // Handle owner expressions.
        if (typeof action.owner === 'string') {
          const m = action.owner.match(/\{(\w+?)\}/);
          if (m) {
            const oName = m[1];
            if (oName === 'me') {
              resolvedAction.owner = this.context.profile.username;
            } else if (oName === 'reporter') {
              resolvedAction.owner = this.props.issue.reporter;
            } else if (oName === 'previous') {
              resolvedAction.owner = this.findPreviousOwner();
            } else if (oName === 'none') {
              resolvedAction.owner = null;
            }
          }
          // If the owner wouldn't change, then don't show that effect.
          if (resolvedAction.owner === issue.owner) {
            resolvedAction.owner = undefined;
          }
        }
        // Only include actions that have an effect.
        if (resolvedAction.state !== undefined || resolvedAction !== undefined) {
          actions.push(resolvedAction);
        }
      }
    }
    return actions;
  }
}
