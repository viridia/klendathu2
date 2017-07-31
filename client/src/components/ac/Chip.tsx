import * as classNames from 'classnames';
import * as React from 'react';
import './Chip.scss';

const CloseIcon = require('icons/ic_close_black_24px.svg');

interface Props {
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
  style?: React.CSSProperties;
}

export default function Chip({ children, className, onClose, style }: Props) {
  return (
    <span className={classNames('chip', className)} style={style}>
      {onClose && <CloseIcon className="close" />}
      <span className="title">{children}</span>
    </span>
  );
}
