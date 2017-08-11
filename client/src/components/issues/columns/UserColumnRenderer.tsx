import { Issue } from 'common/api';
import * as React from 'react';
import AbstractColumnRenderer from './AbstractColumnRenderer';

export default class UserColumnRenderer extends AbstractColumnRenderer {
  public render(issue: Issue) {
    return (
      <td className={this.className} key={this.fieldName}>
        {(issue as any)[this.fieldName] || <div className="unassigned">unassigned</div>}
      </td>
    );
  }
}
