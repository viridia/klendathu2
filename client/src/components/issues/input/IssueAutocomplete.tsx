import autobind from 'bind-decorator';
import { Issue, Project } from 'common/api';
import * as React from 'react';
import { ApolloClient, withApollo } from 'react-apollo';
import IssueSearchQuery from '../../../graphql/queries/issueSearch.graphql';
import AutocompleteChips, { SearchCallback } from '../../ac/AutocompleteChips';
import '../../ac/Chip.scss';

interface Props {
  project: Project;
  exclude?: number;
  client: ApolloClient;
  selection: Issue | Issue[];
  onSelectionChange: (selection: Issue | Issue[] | null) => void;
}

class IssueAutoComplete extends React.Component<Props> {
  public render() {
    return (
      <AutocompleteChips
          {...this.props}
          onSearch={this.onSearch}
          onGetValue={this.onGetValue}
          onGetSortKey={this.onGetSortKey}
          onRenderSuggestion={this.onRenderSuggestion}
          onRenderSelection={this.onRenderSelection}
      />
    );
  }

  @autobind
  private onSearch(search: string, callback: SearchCallback<Issue>) {
    if (search.length < 1) {
      callback([]);
    } else {
      this.props.client.query<{ issueSearch: Issue[] }>({
        query: IssueSearchQuery,
        variables: { search, project: this.props.project.id },
      }).then(resp => {
        callback(resp.data.issueSearch.filter(issue => issue.id !== this.props.exclude));
      });
    }
  }

  @autobind
  private onRenderSuggestion(issue: Issue) {
    return (
      <span className="issue-ref">
        <span className="id">#{issue.id}: </span>
        <span className="summary">{issue.summary}</span>
      </span>
    );
  }

  @autobind
  private onRenderSelection(issue: Issue) {
    return this.onRenderSuggestion(issue);
  }

  @autobind
  private onGetValue(issue: Issue) {
    return issue.id;
  }

  @autobind
  private onGetSortKey(issue: Issue) {
    return issue.summary;
    // return -issue.score;
  }
}

export default withApollo(IssueAutoComplete);
