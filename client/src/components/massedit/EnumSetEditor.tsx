import autobind from 'bind-decorator';
import { FieldType } from 'common/api';
import * as Immutable from 'immutable';
import * as React from 'react';
import { Checkbox } from 'react-bootstrap';

export type EnumSet = Immutable.Set<string>;

interface Props {
  field: FieldType;
  value: EnumSet;
  onChange: (value: EnumSet) => void;
}

export class EnumSetEditor extends React.Component<Props> {
  public render() {
    const { field, value } = this.props;
    return (
      <div className="select-types">
        {field.values.map(v => (
          <Checkbox key={v} data-id={v} checked={value.has(v)} onChange={this.onChange}>
            {v}
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
