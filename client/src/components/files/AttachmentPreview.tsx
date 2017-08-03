import autobind from 'bind-decorator';
import * as classNames from 'classnames';
import { Attachment } from 'common/api';
import CloseIcon from 'icons/ic_close_black_24px.svg';
import * as React from 'react';
import { ProgressBar } from 'react-bootstrap';
import FileIcon from './FileIcon';
import UploadableFile from './UploadableFile';

interface Props {
  attachment: Attachment;
  onRemove: (attachment: Attachment) => void;
}

interface State {
  progress: number;
  loaded: boolean;
}

/** React component that renders a single attachment to be uploaded. */
export default class AttachmentPreview extends React.Component<Props, State> {
  constructor(props: Props, context: any) {
    super(props, context);
    // this.onProgress = this.onProgress.bind(this);
    // this.onRemove = this.onRemove.bind(this);
    this.state = {
      progress: 0,
      loaded: !!props.attachment.url,
    };
  }

  public componentDidMount() {
    if (!this.props.attachment.url) {
      (this.props.attachment as UploadableFile).upload(this.onProgress).then(data => {
        if (data) {
          this.setState({ loaded: true });
        }
      });
    }
  }

  public render() {
    const { type, filename, url, thumbnail } = this.props.attachment;
    return (
      <div
          className={classNames('issue-attachment', { loaded: this.state.loaded })}
          title={filename}
      >
        <div className="icon">
          <button className="close" onClick={this.onRemove}><CloseIcon /></button>
          <FileIcon type={type} filename={filename} url={url} thumbnail={thumbnail} />
        </div>
        <div className="name">{filename}</div>
        <ProgressBar striped={true} bsStyle="success" now={this.state.progress} />
      </div>
    );
  }

  @autobind
  private onProgress(value: any) {
    this.setState({ progress: (value.loaded * 100) / value.total });
  }

  @autobind
  private onRemove(e: any) {
    e.preventDefault();
    this.props.onRemove(this.props.attachment);
  }
}
