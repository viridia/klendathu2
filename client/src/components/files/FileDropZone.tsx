import autobind from 'bind-decorator';
import * as classNames from 'classnames';
import { Attachment } from 'common/api';
import * as Immutable from 'immutable';
import * as React from 'react';
import { ConnectDropTarget, DropTarget, DropTargetConnector, DropTargetMonitor } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import './attachments.scss';
import UploadableFile from './UploadableFile';

type AttachmentsMap = Immutable.OrderedMap<string, Attachment>;

const fileTarget = {
  // drop(props, monitor) {
  // },
};

function collect(connect: DropTargetConnector, monitor: DropTargetMonitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
  };
}

interface OuterProps {
  files: AttachmentsMap;
  onChangeFiles: (files: AttachmentsMap) => void;
}

interface Props extends OuterProps {
  isOver: boolean;
  canDrop: boolean;
  connectDropTarget: ConnectDropTarget;
}

class FileDropZone extends React.Component<Props> {
  private fileInput: HTMLInputElement;

  public render() {
    const { connectDropTarget, isOver, canDrop } = this.props;
    return connectDropTarget(
      <label
          onDrop={this.onDrop}
          htmlFor="upload"
          className={classNames('file-drop-zone', { over: isOver, canDrop })}
      >
        {this.props.files.size === 0 && <span>Drop files here to upload (or click)</span>}
        <input
            type="file"
            id="upload"
            multiple={true}
            style={{ display: 'none' }}
            onChange={this.onFileChange}
            ref={el => { this.fileInput = el; }}
        />
      </label>,
    );
  }

  @autobind
  private onDrop(e: any) {
    this.addFiles(e.dataTransfer.files);
  }

  @autobind
  private onFileChange() {
    this.addFiles(this.fileInput.files as any);
    this.fileInput.value = '';
  }

  private addFiles(fileList: Iterable<File>) {
    let files = this.props.files;
    for (const f of fileList) {
      const attachment = new UploadableFile(f);
      files = files.set(attachment.filename, attachment);
    }
    this.props.onChangeFiles(files);
  }
}

export default DropTarget<OuterProps>(NativeTypes.FILE, fileTarget, collect)(FileDropZone);
