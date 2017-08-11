import { Issue } from 'common/api';
import * as React from 'react';
import RelativeDate from '../../common/RelativeDate';
import AbstractColumnRenderer from './AbstractColumnRenderer';

export default class DateColumnRenderer extends AbstractColumnRenderer {
  public render(issue: Issue) {
    return (
      <td className={this.className} key={this.fieldName}>
        <RelativeDate date={new Date((issue as any)[this.fieldName])} brief={true} />
      </td>
    );
  }
}
