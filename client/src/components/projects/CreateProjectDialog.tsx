import * as PropTypes from 'prop-types';
import * as React from 'react';
import {
  Button, Checkbox, ControlLabel, FormControl, FormGroup, HelpBlock, Modal,
} from 'react-bootstrap';
import autobind from '../../lib/autobind';
import { createProject } from '../../store/project';
import './CreateProjectDialog.scss';

const AddBoxIcon = require('icons/ic_add_box_black_24px.svg');

interface Props {
  onHide: () => void;
}

interface State {
  owner: string;
  projectName: string;
  projectNameError?: string;
  projectTitle: string;
  projectTitleError?: string;
  public: boolean;
  busy: boolean;
}

export default class CreateProjectDialog extends React.Component<Props, State> {
  public static contextTypes = {
    profile: PropTypes.shape({}),
  };

  constructor(props: Props, context: any) {
    super(props, context);
    this.state = {
      owner: '',
      projectName: '',
      projectNameError: null,
      projectTitle: '',
      projectTitleError: null,
      public: false,
      busy: false,
    };
  }

  public render() {
    const { profile } = this.context;
    return (
      <Modal
          show={true}
          onHide={this.props.onHide}
          dialogClassName="create-project"
      >
        <Modal.Header closeButton={true}>
          <Modal.Title>Create Project</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="create-project-form" onSubmit={this.onCreate}>
            <FormGroup
                controlId="project_name"
                validationState={this.state.projectNameError ? 'error' : null}
            >
              <ControlLabel>Project Id</ControlLabel>
              <FormControl
                  autoFocus={true}
                  type="text"
                  label="Project Name"
                  value={this.state.projectName}
                  onChange={this.onChangeProjectName}
              />
            </FormGroup>
            <HelpBlock>{this.state.projectNameError}</HelpBlock>
            <FormGroup
                controlId="project_title"
                validationState={this.state.projectTitleError ? 'error' : null}
            >
              <ControlLabel>Project Title</ControlLabel>
              <FormControl
                  type="text"
                  label="Project Title"
                  value={this.state.projectTitle}
                  onChange={this.onChangeProjectTitle}
              />
            </FormGroup>
            <HelpBlock>{this.state.projectTitleError}</HelpBlock>
            <FormGroup controlId="project_owner">
              <ControlLabel>Owner</ControlLabel>
              <FormControl
                  componentClass="select"
                  label="Owner"
                  value={this.state.owner}
                  onChange={this.onChangeOwner}
              >
                <option value="">{profile.username}</option>
                <option value="org">organization</option>
              </FormControl>
            </FormGroup>
            <Checkbox checked={this.state.public} onChange={this.onChangePublic}>
              Public
            </Checkbox>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onHide}>Cancel</Button>
          <Button
              onClick={this.onCreate}
              disabled={this.state.projectName.length === 0 || this.state.busy}
              bsStyle="primary"
          >
            <AddBoxIcon />
            Create Project
          </Button>
        </Modal.Footer>
      </Modal>);
  }

  @autobind
  private onCreate(ev: any) {
    ev.preventDefault();
    const newState: Partial<State> = {
      projectNameError: null,
      projectTitleError: null,
      busy: false,
    };
    this.setState({ busy: true });
    createProject({
      owningUser: this.state.owner,
      name: this.state.projectName,
      title: this.state.projectTitle,
      isPublic: this.state.public,
    }).then(() => {
      newState.projectName = '';
      newState.projectTitle = '';
      newState.owner = '';
      this.setState(newState as State);
      this.props.onHide();
    }, error => {
      if (error.graphQLErrors) {
        for (const e of error.graphQLErrors) {
          if (!e.details) {
            console.error(e);
            newState.projectNameError = e.message;
            continue;
          }
          switch (e.details.error) {
            case 'name-exists':
              newState.projectNameError = 'A project with this name already exists.';
              break;
            case 'name-too-short':
              newState.projectNameError = 'Project name must be at least 6 characters.';
              break;
            case 'invalid-name':
              newState.projectNameError =
                'Project name may only contain lower-case letters, numbers and hyphens.';
              break;
            default:
              if (e.message) {
                console.error('Server error:', e.message);
              } else {
                console.error('Unrecognized error code:', e.message, e.details.error);
              }
              newState.projectNameError = 'Internal server error.';
              break;
          }
        }
      } else {
        newState.projectNameError = 'Internal server error.';
        console.error('create project error:', error);
      }
      this.setState(newState as State);
    });
  }

  @autobind
  private onChangeOwner(e: any) {
    this.setState({ owner: e.target.value });
  }

  @autobind
  private onChangeProjectName(e: any) {
    this.setState({ projectName: e.target.value });
  }

  @autobind
  private onChangePublic(e: any) {
    this.setState({ public: e.target.checked });
  }

  @autobind
  private onChangeProjectTitle(e: any) {
    this.setState({ projectTitle: e.target.value });
  }
}
