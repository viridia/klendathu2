import autobind from 'bind-decorator';
import { Label, Project, ProjectPrefs, Role } from 'common/api';
import * as dateFormat from 'dateformat';
import * as Immutable from 'immutable';
import * as React from 'react';
import { DefaultChildProps, graphql } from 'react-apollo';
import { Button, Checkbox, Modal } from 'react-bootstrap';
import { toastr } from 'react-redux-toastr';
import { deleteLabel } from '../../store/reducers/label';
import { setProjectPrefs } from '../../store/reducers/projectPrefs';
import LabelName from '../common/LabelName';
import ErrorDisplay from '../debug/ErrorDisplay';
import './../common/card.scss';
import LabelDialog from './LabelDialog';
import './LabelList.scss';

const LabelsQuery = require('../../graphql/queries/labels.graphql');

interface Data {
  labels: Label[];
  projectPrefs: ProjectPrefs;
}

interface Props {
  project: Project;
}

interface State {
  showCreate: boolean;
  showDelete: boolean;
  labelToDelete?: Label;
  labelToUpdate: Label;
  visible: Immutable.Set<number>;
  busy: boolean;
}

class LabelList extends React.Component<DefaultChildProps<Props, Data>, State> {
  constructor(props: DefaultChildProps<Props, Data>) {
    super(props);
    this.state = {
      showCreate: false,
      showDelete: false,
      labelToDelete: null,
      labelToUpdate: null,
      visible: this.visibleSet(props),
      busy: false,
    };
  }

  public componentWillReceiveProps(nextProps: DefaultChildProps<Props, Data>) {
    this.setState({ visible: this.visibleSet(nextProps) });
  }

  public render() {
    const { error } = this.props.data;
    const { project } = this.props;
    if (error) {
      return <ErrorDisplay error={error} />;
    }
    return (
      <section className="kdt label-list">
        {this.state.showCreate && (
          <LabelDialog
              project={this.props.project}
              label={this.state.labelToUpdate}
              visible={!this.state.labelToUpdate
                  || this.state.visible.has(this.state.labelToUpdate.id)}
              onHide={this.onHideCreate}
              onInsertLabel={this.onCreateLabel}
          />)}
        {this.state.showDelete && (
          <Modal show={true} onHide={this.onHideDelete}>
            <Modal.Header closeButton={true}>
              <Modal.Title>Delete Label</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you absolutely sure you want to label &apos;{this.state.labelToDelete.name}&apos;?
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={this.onHideDelete}>Cancel</Button>
              <Button bsStyle="primary" onClick={this.onDeleteLabel}>Delete</Button>
            </Modal.Footer>
          </Modal>
        )}
        <header>
          <span className="title">Labels</span>
          {project.role >= Role.DEVELOPER && <Button onClick={this.onShowCreate}>New Label</Button>}
        </header>
        {this.renderLabels()}
      </section>
    );
  }

  private renderLabels() {
    const { project } = this.props;
    const { labels } = this.props.data;
    if (!labels || labels.length === 0) {
      return (
        <div className="card report">
          <div className="no-issues">No labels defined</div>
        </div>
      );
    }
    return (
      <div className="card report">
        <table>
          <thead>
            <tr className="heading">
              <th className="id center">#</th>
              <th className="visible center">Hotlist</th>
              <th className="name center">Label</th>
              <th className="owner center">Creator</th>
              <th className="created center">Created</th>
              {project.role >= Role.DEVELOPER && <th className="actions">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {labels.map(i => this.renderLabel(i))}
          </tbody>
        </table>
      </div>
    );
  }

  private renderLabel(label: Label) {
    const { project } = this.props;
    return (
      <tr key={label.id}>
        <td className="label-id center">{label.id}</td>
        <td className="visible center">
          <Checkbox
              bsClass="cbox"
              data-id={label.id}
              checked={this.state.visible.has(label.id)}
              onChange={this.onChangeVisible}
          />
        </td>
        <td className="name center"><LabelName project={label.project} label={label.id} /></td>
        <td className="creator center">label.creator</td>
        <td className="created center">{dateFormat(label.created, 'mmm dS, yyyy h:MM TT')}</td>
        {project.role >= Role.DEVELOPER && (<td className="actions center">
          <Button data-label={label.id} onClick={e => this.onShowUpdate(label)}>Edit</Button>
          <Button data-label={label.id} onClick={e => this.onShowDelete(label)}>Delete</Button>
        </td>)}
      </tr>);
  }

  @autobind
  private onShowCreate() {
    this.setState({ showCreate: true, labelToUpdate: null });
  }

  @autobind
  private onHideCreate() {
    this.setState({ showCreate: false });
  }

  @autobind
  private onCreateLabel() {
    //
  }

  @autobind
  private onShowDelete(label: Label) {
    this.setState({ showDelete: true, labelToDelete: label });
  }

  @autobind
  private onHideDelete() {
    this.setState({ showDelete: false });
  }

  @autobind
  private onDeleteLabel() {
    this.setState({ busy: true });
    deleteLabel(this.props.project.id, this.state.labelToDelete.id).then(() => {
      this.setState({ showDelete: false, busy: false });
    }, error => {
      console.error(error);
      if (error.response && error.response.data && error.response.data.err) {
        toastr.error('Operation failed.', `Server returned '${error.response.data.err}'`);
      } else {
        toastr.error('Operation failed.', error.message);
      }
      this.setState({ showDelete: false, busy: false });
    });
  }

  @autobind
  private onShowUpdate(label: Label) {
    this.setState({ showCreate: true, labelToUpdate: label });
  }

  @autobind
  private onChangeVisible(e: any) {
    const { project } = this.props;
    const id = parseInt(e.target.dataset.id, 10);
    if (e.target.checked) {
      setProjectPrefs(project.id, { labelsToAdd: [id] });
    } else {
      setProjectPrefs(project.id, { labelsToRemove: [id] });
    }
  }

  private visibleSet(props: DefaultChildProps<Props, Data>): Immutable.Set<number> {
    const { projectPrefs } = props.data;
    return Immutable.Set<number>(projectPrefs ? projectPrefs.labels : []);
  }
}

export default graphql(LabelsQuery, {
  options: ({ project }: Props) => ({ variables: { project: project.id } }),
})(LabelList);
