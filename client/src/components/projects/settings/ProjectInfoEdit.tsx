import autobind from 'bind-decorator';
import { Project, Role } from 'common/api';
import * as React from 'react';
import { Button, Checkbox, ControlLabel, FormControl } from 'react-bootstrap';
import { updateProject } from '../../../store/reducers/project';

interface Props {
  project: Project;
}

interface State {
  description: string;
  title: string;
  isPublic: boolean;
}

export default class ProjectInfoEdit extends React.Component<Props, State> {
  constructor(props: Props) {
    super();
    this.state = {
      description: props.project.description,
      title: props.project.title || '',
      isPublic: props.project.isPublic,
    };
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (nextProps.project.id !== this.props.project.id) {
      const { title, description } = nextProps.project;
      this.setState({ title, description, isPublic: !!nextProps.project.isPublic });
    }
  }

  public render() {
    const { project } = this.props;
    const modified =
        project.title !== this.state.title ||
        project.description !== this.state.description ||
        project.isPublic !== this.state.isPublic;
    return (
      <section className="settings-tab-pane">
        <header>
          <span className="title">{project.name}</span>
          <Button
              bsStyle="primary"
              disabled={!modified || project.role < Role.MANAGER}
              onClick={this.onSave}
          >
            Save
          </Button>
        </header>
        <table className="form-table">
          <tbody>
            <tr>
              <th className="header"><ControlLabel>Title:</ControlLabel></th>
              <td>
                <FormControl
                    className="title"
                    type="text"
                    placeholder="title of the project"
                    disabled={project.role < Role.MANAGER}
                    value={this.state.title}
                    onChange={this.onChangeTitle}
                />
              </td>
            </tr>
            <tr>
              <th className="header"><ControlLabel>Description:</ControlLabel></th>
              <td>
                <FormControl
                    className="description"
                    type="text"
                    placeholder="description of the project"
                    disabled={project.role < Role.MANAGER}
                    value={this.state.description}
                    onChange={this.onChangeDescription}
                />
              </td>
            </tr>
            <tr>
              <th />
              <td>
                <Checkbox
                    checked={this.state.isPublic}
                    onChange={this.onChangePublic}
                    disabled={project.role < Role.MANAGER}
                >
                  Public
                </Checkbox>
              </td>
            </tr>
            {/*<tr>
              <th className="header"><ControlLabel>Owner:</ControlLabel></th>
              <td className="owner single-static">
                {project.owningUser}
              </td>
            </tr>*/}
          </tbody>
        </table>
      </section>
    );
  }

  @autobind
  private onChangeTitle(e: any) {
    this.setState({ title: e.target.value });
  }

  @autobind
  private onChangeDescription(e: any) {
    this.setState({ description: e.target.value });
  }

  @autobind
  private onChangePublic(e: any) {
    this.setState({ isPublic: e.target.checked });
  }

  @autobind
  private onSave(e: any) {
    e.preventDefault();
    e.stopPropagation();
    const { title, description } = this.state;
    updateProject(this.props.project.id, { title, description, isPublic: this.state.isPublic });
  }
}
