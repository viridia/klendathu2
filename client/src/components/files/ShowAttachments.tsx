import { Attachment } from 'common/api';
import * as React from 'react';
import FileIcon from './FileIcon';

interface Props {
  attachments: Attachment[];
}

/** React component that represents a list of attachments to an issue. */
export default class ShowAttachments extends React.Component<Props> {
  public render() {
    return (
      <div className="attachments">
        {this.props.attachments.map(a => this.renderFile(a))}
      </div>
    );
  }

  private renderFile(attachment: Attachment) {
    return (
      <div className="issue-attachment" key={attachment.id} title={attachment.filename}>
        <a href={attachment.url} className="icon" target="_blank" rel="noopener noreferrer">
          <FileIcon
              type={attachment.type}
              filename={attachment.filename}
              url={attachment.url}
              thumbnail={attachment.thumbnail}
          />
        </a>
        <div className="name">{attachment.filename}</div>
      </div>
    );
  }
}
