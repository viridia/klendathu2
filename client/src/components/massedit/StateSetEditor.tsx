import autobind from 'bind-decorator';
import { Workflow } from 'common/api';
import * as Immutable from 'immutable';
import * as React from 'react';
import { Checkbox } from 'react-bootstrap';

export type StateSet = Immutable.Set<string>;

interface Props {
  workflow: Workflow;
  value: StateSet;
  onChange: (value: StateSet) => void;
}

export class StateSetEditor extends React.Component<Props> {
  public render() {
    const { workflow, value } = this.props;
    return (
      <div className="select-states">
        {workflow.states.map(st => (
          <Checkbox key={st.id} data-id={st.id} checked={value.has(st.id)} onChange={this.onChange}>
            {st.caption}
          </Checkbox>))}
      </div>
    );
  }

  @autobind
  private onChange(e: any) {
    if (e.target.checked) {
      this.props.onChange(this.props.value.add(e.target.dataset.id));
    } else {
      this.props.onChange(this.props.value.remove(e.target.dataset.id));
    }
  }
}
