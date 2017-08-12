import * as React from 'react';
import { Button, Modal } from 'react-bootstrap';
import './ConfirmDialog.scss';

export default function ConfirmDialog({
    title,
    children,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    busy,
  }: {
    title: string,
    children: JSX.Element[] | string,
    confirmText: string,
    cancelText: string,
    onConfirm: () => void,
    onCancel: () => void,
    busy?: boolean,
  }) {
  return (
    <Modal show={true} onHide={onCancel} dialogClassName="confirm-dialog">
      <Modal.Header closeButton={true}>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {children}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onCancel}>{cancelText}</Button>
        <Button onClick={onConfirm} disabled={busy} bsStyle="primary">{confirmText}</Button>
      </Modal.Footer>
    </Modal>);
}
