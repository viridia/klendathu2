import autobind from 'bind-decorator';
import { Project, Workflow } from 'common/api';
import * as Immutable from 'immutable';
import * as React from 'react';
import { ControlLabel, FormGroup, Radio } from 'react-bootstrap';

interface Props {
  state: string;
  prevState?: string;
  project: Project;
  workflow: Workflow;
  onStateChanged: (state: string) => void;
}

/** Selects the state of the issue. */
export default class StateSelector extends React.Component<Props> {
  private stateMap: Immutable.Map<string, any>;

  constructor(props: Props) {
    super(props);
    this.stateMap = Immutable.Map(props.workflow.states.map(st => [st.id, st]));
  }

  public componentDidUpdate() {
    this.stateMap = Immutable.Map(this.props.workflow.states.map(st => [st.id, st]));
  }

  @autobind
  public onChange(e: any) {
    this.props.onStateChanged(e.target.dataset.state);
  }

  public render() {
    function caption(state: any) {
      if (state.closed) {
        return <span>Closed: {state.caption}</span>;
      } else {
        return state.caption;
      }
    }

    const prevState = this.props.prevState || this.props.state;
    const nextState = this.props.state;
    const prevStateInfo = this.stateMap.get(prevState);
    const transitions = (this.props.prevState && prevStateInfo)
        ? prevStateInfo.transitions : this.props.workflow.start.filter(st => st !== nextState);
    return (
      <FormGroup controlId="state">
        <ControlLabel>State</ControlLabel>
        <Radio
            checked={prevState === nextState}
            data-state={prevState}
            onChange={this.onChange}
        >
          {caption(prevStateInfo)}
        </Radio>
        {transitions.map((s: string) => {
          const toState = this.stateMap.get(s);
          return (
            <Radio
              key={toState.id}
              checked={toState.id === nextState}
              data-state={toState.id}
              onChange={this.onChange}
            >
              {caption(toState)}
            </Radio>
          );
        })}
      </FormGroup>
    );
  }
}
