import autobind from 'bind-decorator';
import { FieldType, Label, Project, Template, User, Workflow } from 'common/api';
import CloseIcon from 'icons/ic_close_black_24px.svg';
import * as Immutable from 'immutable';
import * as React from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import defaultValueForType from '../../lib/defaultValueForType';
import EditOperand from './EditOperand';

interface ActionType {
  caption: string;
  type: string;
  apply: <P>(issue: Editable, update: Editable, value: P) => void;
  customField?: FieldType;
}

interface EditAction extends ActionType {
  id: string;
  value: any;
}

interface Editable {
  [field: string]: any;
}

function append<P>(issue: Editable, updates: Editable, fieldName: string, values: P[]) {
  const before = Immutable.OrderedSet<P>(issue[fieldName]);
  const after = before.union(values);
  if (before !== after) {
    updates[fieldName] = after.toArray();
    return true;
  }
  return false;
}

function remove<P>(issue: Editable, updates: Editable, fieldName: string, values: P[]) {
  const before = Immutable.OrderedSet<P>(issue[fieldName]);
  const after = before.subtract(values);
  if (before !== after) {
    updates[fieldName] = after.toArray();
    return true;
  }
  return false;
}

interface Props {
  index?: number;
  action?: EditAction;
  project: Project;
  template: Template;
  workflow: Workflow;
  onChange: (index: number, action: EditAction & ActionType) => void;
  onRemove: (index: number) => void;
}

export default class MassAction extends React.Component<Props> {
  private static ACTION_TYPES = Immutable.OrderedMap<string, ActionType>({
    addLabel: {
      caption: 'Add Label',
      type: 'label',
      apply: (issue: Editable, update: Editable, value: Label[]) => {
        return append(issue, update, 'labels', value.map(v => v.id));
      },
    },
    removeLabel: {
      caption: 'Remove Label',
      type: 'label',
      apply: (issue: Editable, update: Editable, value: Label[]) => {
        return remove(issue, update, 'labels', value.map(v => v.id));
      },
    },
    state: {
      caption: 'Change State',
      type: 'state',
      apply: (issue: Editable, update: Editable, value: string) => {
        if (issue.state !== value) {
          update.state = value;
          return true;
        }
        return false;
      },
    },
    type: {
      caption: 'Change Type',
      type: 'type',
      apply: (issue: Editable, update: Editable, value: string) => {
        if (issue.type !== value) {
          update.type = value;
          return true;
        }
        return false;
      },
    },
    owner: {
      caption: 'Change Owner',
      type: 'user',
      apply: (issue: Editable, update: Editable, value: User) => {
        const user = value ? value.username : null;
        if (issue.owner !== user) {
          update.owner = user;
          return true;
        }
        return false;
      },
    },
    addCC: {
      caption: 'Add CC',
      type: 'users',
      apply: (issue: Editable, update: Editable, value: User[]) => {
        return append(issue, update, 'cc', value.map(user => user.username));
      },
    },
    removeCC: {
      caption: 'Remove CC',
      type: 'users',
      apply: (issue: Editable, update: Editable, value: User[]) => {
        return remove(issue, update, 'cc', value.map(user => user.username));
      },
    },
    delete: {
      caption: 'Delete',
      action: 'delete',
      apply: () => {/* */},
    },
  });

  constructor() {
    super();
    this.onSelectActionType = this.onSelectActionType.bind(this);
    this.onChangeValue = this.onChangeValue.bind(this);
    this.onRemove = this.onRemove.bind(this);
  }

  public render() {
    const { index, action, project, template, workflow } = this.props;
    const items: JSX.Element[] = [];
    MassAction.ACTION_TYPES.forEach((at, id) => {
      items.push(<MenuItem eventKey={id} key={id}>{at.caption}</MenuItem>);
    });
    const caption = (action && action.caption) || 'Choose action...';

    return (
      <section className="mass-action">
        <DropdownButton
            bsSize="small"
            title={caption}
            id="action-id"
            onSelect={this.onSelectActionType}
        >
          {items}
        </DropdownButton>
        <section className="action-operand">
          {action && (<EditOperand
              type={action.type}
              value={action.value}
              customField={action.customField}
              project={project}
              template={template}
              workflow={workflow}
              onChange={this.onChangeValue}
          />)}
        </section>
        {index !== undefined &&
          <button className="remove" onClick={this.onRemove}><CloseIcon /></button>}
    </section>
    );
  }

  // renderOpValue() {
  //   return null;
  // }

  @autobind
  private onSelectActionType(id: any) {
    const { index, action, template, workflow } = this.props;
    const newAction = MassAction.ACTION_TYPES.get(id);
    if (!action || newAction.type !== action.type) {
      this.props.onChange(index, {
        ...newAction,
        value: defaultValueForType(template, workflow, newAction.type, newAction.customField),
        id,
      });
    } else {
      this.props.onChange(index, { ...newAction, value: action.value, id });
    }
  }

  @autobind
  private onChangeValue(value: any) {
    const { index, action } = this.props;
    this.props.onChange(index, { ...action, value });
  }

  @autobind
  private onRemove(e: any) {
    e.preventDefault();
    this.props.onRemove(this.props.index);
  }
}
