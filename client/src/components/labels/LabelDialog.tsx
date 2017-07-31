import * as classNames from 'classnames';
import { Label, Project } from 'common/api';
import * as PropTypes from 'prop-types';
import * as React from 'react';
import { withApollo } from 'react-apollo';
import { Button, Checkbox, ControlLabel, FormControl, FormGroup, Modal } from 'react-bootstrap';
import { toastr } from 'react-redux-toastr';
import autobind from '../../lib/autobind';
import { createLabel, updateLabel } from '../../store/reducers/label';
import { setProjectPrefs } from '../../store/reducers/projectPrefs';
import '../ac/Chip.scss';
import LABEL_COLORS from '../common/labelColors'; // tslint:disable-line
import './LabelDialog.scss';

interface Props {
  project: Project;
  label?: Label;
  onHide: () => void;
  onInsertLabel: (label: Label) => void;
  visible?: boolean;
}

interface State {
  name: string;
  color: string;
  visible: boolean;
  busy: boolean;
}

class LabelDialog extends React.Component<Props, State> {
  public static contextTypes = {
    profile: PropTypes.shape({
      username: PropTypes.string.isRequired,
    }),
  };

  constructor(props: Props) {
    super(props);
    if (props.label) {
      this.state = {
        name: props.label.name,
        color: props.label.color,
        visible: props.visible,
        busy: false,
      };
    } else {
      this.state = {
        name: '',
        color: '#e679f8',
        busy: false,
        visible: true,
      };
    }
  }

  public render() {
    const { label } = this.props;
    return (
      <Modal
          show={true}
          onHide={this.props.onHide}
          dialogClassName="create-label"
      >
        <Modal.Header closeButton={true}>
          {label
              ? <Modal.Title>Edit Label</Modal.Title>
              : <Modal.Title>Create Label</Modal.Title>}
        </Modal.Header>
        <Modal.Body>
          <FormGroup controlId="name">
            <ControlLabel>Label text</ControlLabel>
            <FormControl
                type="text"
                value={this.state.name}
                placeholder="Text for this label"
                autoFocus={true}
                maxLength={64}
                onChange={this.onChangeLabelText}
                onKeyDown={this.onKeyDown}
            />
            <FormControl.Feedback />
          </FormGroup>
          <FormGroup controlId="visible">
            <Checkbox checked={this.state.visible} onChange={this.onChangeVisible}>
              Show in hotlist
            </Checkbox>
          </FormGroup>
          <FormGroup controlId="color">
            <ControlLabel>Label color</ControlLabel>
            <div className="color-table">
              {LABEL_COLORS.map((row, index) => (
                <div className="color-column" key={index}>
                  {row.map(color =>
                    <button
                        className={classNames('color-selector',
                          { selected: color === this.state.color })}
                        key={color}
                        data-color={color}
                        style={{ backgroundColor: color }}
                        onClick={this.onChangeLabelColor}
                    >
                      A
                    </button>)}
                </div>))}
            </div>
          </FormGroup>
          <FormGroup controlId="preview">
            <ControlLabel>Label preview:</ControlLabel>
            <div
                className="label-preview chip"
                style={{ backgroundColor: this.state.color }}
            >
              <span className="title">{this.state.name || '???'}</span>
            </div>
          </FormGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onHide}>Cancel</Button>
          <Button
              onClick={this.onUpdateLabel}
              disabled={this.state.name.length < 3 || this.state.busy}
              bsStyle="primary"
          >
            {label ? 'Save' : 'Create'}
          </Button>
        </Modal.Footer>
      </Modal>);
  }

  @autobind
  private onChangeLabelText(e: any) {
    this.setState({ name: e.target.value });
  }

  @autobind
  private onChangeVisible(e: any) {
    this.setState({ visible: e.target.checked });
  }

  @autobind
  private onChangeLabelColor(e: any) {
    this.setState({ color: e.target.dataset.color });
  }

  @autobind
  private onKeyDown(e: any) {
    if (e.keyCode === 13 && this.state.name.length >= 3) { // RETURN
      e.preventDefault();
      e.stopPropagation();
      this.onUpdateLabel();
    }
  }

  @autobind
  private onUpdateLabel() {
    const { label, project } = this.props;
    const { name, color, visible } = this.state;
    this.setState({ busy: true });
    let result: Promise<Label>;
    if (label) {
      result = updateLabel(this.props.project.id, label.id, { name, color }).then(resp => {
        return resp.data.updateLabel;
      });
    } else {
      result = createLabel(this.props.project.id, { name, color }).then(resp => {
        return resp.data.newLabel;
      });
    }
    // const result = label ?
    //   updateLabel(this.props.project.id, label.id, { name, color }) :
    //   createLabel(this.props.project.id, { name, color });

    result.then(updatedLabel => {
      // const updatedLabel = resp.data.updateLabel || resp.data.newLabel;
      if (!label || label.visible !== visible) {
        const update: { labelsToAdd?: number[]; labelsToRemove?: number[]; } = {};
        if (visible) {
          update.labelsToAdd = [updatedLabel.id];
        } else {
          update.labelsToRemove = [updatedLabel.id];
        }

        setProjectPrefs(project.id, update).then(() => {
          this.props.onInsertLabel(updatedLabel);
          this.setState({ busy: false });
          this.props.onHide();
        });
      } else {
        this.props.onInsertLabel(updatedLabel);
        this.setState({ busy: false });
        this.props.onHide();
      }
    }, error => {
      console.error(error);
      if (error.response && error.response.data && error.response.data.err) {
        switch (error.response.data.err) {
          case 'no-project':
            toastr.error('Operation failed.', 'Invalid project id');
            break;
          default:
            toastr.error('Operation failed.', `Server returned '${error.response.data.err}'`);
            console.error('response:', error.response);
            break;
        }
      } else {
        toastr.error('Operation failed.', error.message);
      }
      this.setState({ busy: false });
      this.props.onHide();
    });
  }
}

export default withApollo(LabelDialog);
