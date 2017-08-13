import { FieldType, Project, Template, Workflow } from 'common/api';
import * as React from 'react';
import { DropdownButton, FormControl, MenuItem } from 'react-bootstrap';
import defaultValueForType from '../../lib/defaultValueForType';
import UserAutoComplete from '../common/UserAutocomplete';
import LabelSelector from '../issues/input/LabelSelector';
import './EditOperand.scss';
import { EnumSetEditor } from './EnumSetEditor';
import { StateSetEditor } from './StateSetEditor';
import { TypeSetEditor } from './TypeSetEditor';

interface Props {
  type: string;
  value: any;
  project: Project;
  template: Template;
  workflow: Workflow;
  customField: FieldType;
  onChange: (value: any) => void;
}

/** Component which allows the user to enter a value for the filter and mass edit functions. */
export default function EditOperand(
  { type, customField, project, template, workflow, onChange, value }: Props) {
  if (!type) {
    return null;
  }
  if (value === null || value === undefined) {
    value = defaultValueForType(template, workflow, type, customField);
  }
  switch (type) {
    case 'searchText':
      return (
        <FormControl
            className="match-text"
            placeholder="text to match"
            value={value}
            onChange={(e: any) => onChange(e.target.value)}
        />
      );
    case 'text':
      return (
        <FormControl
            className="match-text"
            placeholder="text to find"
            value={value}
            onChange={(e: any) => onChange(e.target.value)}
        />
      );
    case 'stateSet': {
      return <StateSetEditor workflow={workflow} value={value} onChange={onChange} />;
    }
    case 'typeSet': {
      return <TypeSetEditor template={template} value={value} onChange={onChange} />;
    }
    case 'state': {
      const items = workflow.states.map(st => (
        <MenuItem eventKey={st.id} key={st.id}>{st.caption}</MenuItem>
      ));
      const selectedState = workflow.states.find(st => st.id === value);
      return (
        <DropdownButton
            bsSize="small"
            title={selectedState ? selectedState.caption : 'Choose state...'}
            id="action-id"
            onSelect={onChange}
        >
          {items}
        </DropdownButton>);
    }
    case 'type': {
      const items = template.types.map(t => (
        !t.abstract && <MenuItem eventKey={t.id} key={t.id}>{t.caption}</MenuItem>
      ));
      const selectedType = template.types.find(t => t.id === value);
      return (
        <DropdownButton
            bsSize="small"
            title={selectedType ? selectedType.caption : 'Choose type...'}
            id="action-id"
            onSelect={onChange}
        >
          {items}
        </DropdownButton>);
    }
    case 'label': {
      return (
        <LabelSelector
            id="labels"
            className="labels inline"
            project={project}
            selection={value}
            onSelectionChange={onChange}
        />);
    }
    case 'user': {
      return (
        <UserAutoComplete
            className="user inline"
            project={project}
            placeholder="(none)"
            selection={value}
            onSelectionChange={onChange}
        />);
    }
    case 'users': {
      return (
        <UserAutoComplete
            className="user inline"
            project={project}
            placeholder="(none)"
            selection={value}
            multiple={true}
            onSelectionChange={onChange}
        />);
    }
    case 'enum': {
      return <EnumSetEditor field={customField} value={value} onChange={onChange} />;
    }
    default:
      return null;
  }
}
