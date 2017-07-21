import * as PropTypes from 'prop-types';
import * as React from 'react';
import { Button } from 'react-bootstrap';
import autobind from '../../lib/autobind';
import CreateProjectDialog from '../projects/CreateProjectDialog';
import ProjectList from '../projects/ProjectList';
import './Dashboard.scss';

const AddBoxIcon = require('icons/ic_add_box_black_24px.svg');

interface State {
  showCreate: boolean;
}

export default class Dashboard extends React.Component<undefined, State> {
  public static contextTypes = {
    profile: PropTypes.shape({
      username: PropTypes.string,
    }),
  };

  constructor() {
    super();
    this.state = { showCreate: false };
  }

  public render() {
    if (!this.context.profile || !this.context.profile.username) {
      return <div className="content" />;
    }
    return (
      <section className="content kdt dashboard">
        <header>
          <div className="title">
            Projects
          </div>
          <Button bsStyle="primary" onClick={this.onOpenCreateDialog}>
            <AddBoxIcon />
            New Project...
          </Button>
        </header>
        <ProjectList />
        {this.state.showCreate && <CreateProjectDialog onHide={this.onCloseCreateDialog} />}
      </section>
    );
  }

  @autobind
  private onOpenCreateDialog(e: any) {
    e.preventDefault();
    this.setState({ showCreate: true });
  }

  @autobind
  private onCloseCreateDialog() {
    this.setState({ showCreate: false });
  }
}
