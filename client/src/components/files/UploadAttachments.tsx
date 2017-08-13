import autobind from 'bind-decorator';
import { Attachment, Project } from 'common/api';
import * as Immutable from 'immutable';
import * as React from 'react';
import AttachmentPreview from './AttachmentPreview';
import './attachments.scss';
import FileDropZone from './FileDropZone';

type AttachmentsMap = Immutable.OrderedMap<string, Attachment>;

interface Props {
  project: Project;
}

interface State {
  files: AttachmentsMap;
}

/** React component that represents a list of attachments to be uploaded. */
export default class UploadAttachments extends React.Component<Props, State> {
  constructor(props: Props, context: any) {
    super(props, context);
    this.state = {
      files: Immutable.OrderedMap(),
    };
  }

  public setFiles(fileList: Attachment[]) {
    let files = this.state.files;
    for (const a of fileList) {
      files = files.set(a.filename, a);
    }
    this.setState({ files });
  }

  public files() {
    return this.state.files.toArray().filter(f => f.url !== null).map(f => f.id);
  }

  public render() {
    return (
      <div className="upload-attachments">
        <div className="files">
          {this.renderFiles()}
        </div>
        <FileDropZone files={this.state.files} onChangeFiles={this.onChangeFiles} />
      </div>
    );
  }

  private renderFiles() {
    const { files } = this.state;
    return files.toArray().map(attachment => (
      <AttachmentPreview
          key={attachment.filename}
          attachment={attachment}
          onRemove={this.onRemove}
      />));
  }

  @autobind
  private onRemove(attachment: Attachment) {
    this.setState({ files: this.state.files.remove(attachment.filename) });
  }

  @autobind
  private onChangeFiles(files: AttachmentsMap) {
    this.setState({ files });
  }
}
