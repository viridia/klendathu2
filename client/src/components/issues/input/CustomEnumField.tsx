import autobind from 'bind-decorator';
import { FieldType } from 'common/api';
import * as React from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';

interface Props {
  field: FieldType;
  value: string;
  onChange: (id: string, value: string) => void;
}

export default class CustomEnumField extends React.Component<Props> {
  public render() {
    const { value, field } = this.props;
    return (
      <DropdownButton
          bsSize="small"
          title={value}
          id={`field_${field.id}`}
          onSelect={this.onSelect as any}
      >
        {this.props.field.values.map(v =>
          <MenuItem key={v} eventKey={v} active={v === value}>{v}</MenuItem>)}
      </DropdownButton>
    );
  }

  @autobind
  private onSelect(value: string) {
    this.props.onChange(this.props.field.id, value);
  }
}
