import { FieldType, Template, Workflow } from 'common/api';
import * as Immutable from 'immutable';

export default function defaultValueForType(
    template: Template,
    workflow: Workflow,
    type: string,
    customField: FieldType): any {
  if (type === 'stateSet') {
    return Immutable.Set(workflow.states.filter(st => !st.closed).map(st => st.id));
  } else if (type === 'typeSet') {
    return Immutable.Set(template.types.filter(t => !t.abstract).map(t => t.id));
  } else if (type === 'label') {
    return [];
  } else if (type === 'user' || type === 'users') {
    return [];
  } else if (type === 'enum') {
    return Immutable.Set(customField.values);
  } else {
    return '';
  }
}
