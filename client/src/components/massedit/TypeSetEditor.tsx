import autobind from 'bind-decorator';
import { Template } from 'common/api';
import * as Immutable from 'immutable';
import * as React from 'react';
import { Checkbox } from 'react-bootstrap';

export type TypeSet = Immutable.Set<string>;

interface Props {
  template: Template;
  value: TypeSet;
  onChange: (value: TypeSet) => void;
}

export class TypeSetEditor extends React.Component<Props> {
  public render() {
    const { template, value } = this.props;
    return (
      <div className="select-types">
        {template.types.map(t => (
          !t.abstract &&
            <Checkbox key={t.id} data-id={t.id} checked={value.has(t.id)} onChange={this.onChange}>
              {t.caption}
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
