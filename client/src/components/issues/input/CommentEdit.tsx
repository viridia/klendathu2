import autobind from 'bind-decorator';
import { Project, Role } from 'common/api';
import * as React from 'react';
import { Button, FormControl } from 'react-bootstrap';
import './CommentEdit.scss';

interface Props {
  project: Project;
  onAddComment: (body: string) => Promise<any>;
}

interface State {
  newComment: string;
}

export default class CommentEdit extends React.Component<Props, State> {
  constructor() {
    super();
    this.state = {
      newComment: '',
    };
  }

  public render() {
    const { role } = this.props.project;
    return (
      <section className="comment-compose">
        <FormControl
            className="comment-entry"
            componentClass="textarea"
            disabled={role < Role.REPORTER}
            value={this.state.newComment}
            placeholder="Leave a comment... (markdown format supported)"
            onChange={this.onChangeCommentBody}
        />
        <Button
            title="add comment"
            disabled={role < Role.REPORTER || this.state.newComment.length === 0}
            onClick={this.onAddComment}
        >
          Comment
        </Button>
      </section>
    );
  }

  @autobind
  private onChangeCommentBody(e: any) {
    this.setState({ newComment: e.target.value });
  }

  @autobind
  private onAddComment() {
    this.props.onAddComment(this.state.newComment).then(() => {
      this.setState({ newComment: '' });
    });
  }
}
