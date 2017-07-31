// tslint:disable:jsx-no-lambda
// tslint:disable:max-classes-per-file
import ApolloClient from 'apollo-client';
import autobind from 'bind-decorator';
import { Label, Project } from 'common/api';
import * as React from 'react';
import { withApollo } from 'react-apollo';
import AutocompleteChips from '../../ac/AutocompleteChips';
import Chip from '../../ac/Chip';
import '../../ac/Chip.scss';
import LabelDialog from '../../labels/LabelDialog';

const LabelSearchQuery = require('../../../graphql/queries/labelSearch.graphql');

interface Props {
  client: ApolloClient;
  project: Project;
  selection: Label[];
  onSelectionChange: (selection: Label[]) => void;
}

interface State {
  showModal: boolean;
}

class AutocompleteLabels extends AutocompleteChips<Label> {}

class LabelSelector extends React.Component<Props, State> {
  private ac: AutocompleteLabels;

  constructor() {
    super();
    this.state = { showModal: false };
  }

  public render() {
    return (
      <div className="label-selector">
        {this.state.showModal && (
          <LabelDialog
              project={this.props.project}
              onHide={this.onCloseModal}
              onInsertLabel={this.onInsertLabel}
          />)}
        <AutocompleteLabels
            {...this.props}
            multiple={true}
            onSearch={this.onSearchLabels}
            onGetValue={this.onGetValue}
            onGetSortKey={this.onGetSortKey}
            onChooseSuggestion={this.onChooseSuggestion}
            onRenderSuggestion={this.onRenderSuggestion}
            onRenderSelection={this.onRenderSelection}
            ref={el => { this.ac = el; }}
        />
      </div>);
  }

  @autobind
  private onSearchLabels(
      token: string,
      callback: (suggestion: Label[], suffixActions: any[]) => void) {
    const newLabelOption = {
      name: <span>New&hellip;</span>,
      id: -1,
    };
    if (token.length === 0) {
      callback([], [newLabelOption]);
    } else {
      this.props.client.query<{ labels: Label[] }>({
        query: LabelSearchQuery,
        variables: { token, project: this.props.project.id },
      }).then(resp => {
        callback(resp.data.labels.slice(0, 5), [newLabelOption]);
      });
    }
  }

  @autobind
  private onChooseSuggestion(label: Label) {
    if (label.id === -1) {
      this.setState({ showModal: true });
      return true;
    }
    return false;
  }

  @autobind
  private onInsertLabel(label: Label) {
    if (label === null || label === undefined) {
      throw new Error('invalid label');
    }
    this.ac.addToSelection(label);
  }

  @autobind
  private onRenderSuggestion(label: Label) {
    return <span key={label.id}>{label.name}</span>;
  }

  @autobind
  private onRenderSelection(label: Label) {
    return (
      <Chip style={{ backgroundColor: label.color }} key={label.id}>{label.name}</Chip>
    );
  }

  @autobind
  private onGetValue(label: Label): number {
    return label.id;
  }

  @autobind
  private onGetSortKey(label: Label) {
    return label.name;
  }

  @autobind
  private onCloseModal() {
    this.setState({ showModal: false });
  }
}

export default withApollo(LabelSelector);
