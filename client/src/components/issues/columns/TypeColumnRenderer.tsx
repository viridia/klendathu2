import { Issue, Template } from 'common/api';
import * as React from 'react';
import AbstractColumnRenderer from './AbstractColumnRenderer';

export default class TypeColumnRenderer extends AbstractColumnRenderer {
  private template: Template;

  constructor(template: Template) {
    super('Type', 'type', 'type pad');
    this.template = template;
  }

  public render(issue: Issue) {
    const typeInfo = this.template.types.find(t => t.id === issue.type);
    return (
      <td className="type" key="type">
        <span style={{ backgroundColor: typeInfo.bg }}>{typeInfo.caption}</span>
      </td>
    );
  }
}
