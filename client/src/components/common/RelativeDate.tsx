import * as dateFormat from 'dateformat';
import * as React from 'react';
import humanAge from '../../lib/humanAge';

export default function RelativeDate({ date, brief = false }: { date: Date, brief: boolean }) {
  return (
    <span className="date" title={dateFormat(date, 'mmm dS, yyyy h:MM TT')}>
      {humanAge(date, brief)}
    </span>
  );
}
