import autobind from 'bind-decorator';
import { Project, Role } from 'common/api';
import * as React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { deleteProject } from '../../store/reducers/project';
import './ProjectCard.scss';

interface Props {
  project: Project;
}

interface State {
  showDelete: boolean;
}

export default class ProjectCard extends React.Component<Props, State> {
  constructor() {
    super();
    this.state = { showDelete: false };
  }

  public render() {
    const { project } = this.props;
    return (
      <div className="card internal project-card" key={project.name}>
        {this.state.showDelete && (
          <Modal show={true} onHide={this.onHideDelete}>
            <Modal.Header closeButton={true}>
              <Modal.Title>Delete Project</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you absolutely sure you want to delete this project?
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={this.onHideDelete}>Cancel</Button>
              <Button bsStyle="primary" onClick={this.onConfirmDelete}>Delete</Button>
            </Modal.Footer>
          </Modal>
        )}
        <div className="project-info">
          <div className="project-name">
            <NavLink className="project-link" to={{ pathname: `/project/${project.name}/issues` }}>
              {project.name}
            </NavLink>
            <div className="description">{project.title}</div>
          </div>
          <div className="project-owner">
            <div className="role">
              <span className="title">Role: </span>
              {Role[project.role].toLowerCase()}
            </div>
          </div>
          <div>
            <Button bsStyle="primary" onClick={this.onShowDelete}>Delete</Button>
          </div>
        </div>
      </div>
    );
  }

  @autobind
  private onShowDelete(ev: any) {
    ev.preventDefault();
    this.setState({ showDelete: true });
  }

  @autobind
  private onHideDelete(ev: any) {
    ev.preventDefault();
    this.setState({ showDelete: false });
  }

  @autobind
  private onConfirmDelete(ev: any) {
    ev.preventDefault();
    this.setState({ showDelete: false });
    deleteProject(this.props.project.id).catch(error => {
      console.error(error);
      this.setState({ showDelete: false });
    });
  }
}
