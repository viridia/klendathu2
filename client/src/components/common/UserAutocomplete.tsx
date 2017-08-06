import autobind from 'bind-decorator';
import { User } from 'common/api';
import * as React from 'react';
import { ApolloClient, withApollo } from 'react-apollo';
import * as UsersQuery from '../../graphql/queries/users.graphql';
import AutocompleteChips from '../ac/AutocompleteChips';
import Chip from '../ac/Chip';

interface Props {
  value: string;
  project: string;
  // onEnter: () => {};
  client: ApolloClient;
  selection: User | User[];
  onSearch: (search: string, callback: (suggestion: User[], suffixActions: User[]) => void) => void;
  onSelectionChange: (selection: User | User[] | null) => void;
}

class UserAutocomplete extends React.Component<Props> {
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
  private onSearch(token: string, callback: (suggestions: User[]) => void) {
    if (token.length < 1) {
      callback([]);
    } else {
      this.props.client.query<{ users: User[] }>({
        query: UsersQuery,
        variables: { token, project: this.props.project },
      }).then(resp => {
        callback(resp.data.users);
      });
    }
  }

  @autobind
  private onRenderSuggestion(user: User): JSX.Element {
    return (
      <span>
        <span className="name">{user.fullname}</span>
        &nbsp;- <span className="username">{user.username}</span>
      </span>
    );
  }

  @autobind
  private onRenderSelection(user: User): JSX.Element {
    return (
      <Chip>
        <span className="name">{user.fullname}</span>
        &nbsp;- <span className="username">{user.username}</span>
      </Chip>
    );
  }

  @autobind
  private onGetValue(user: User): string {
    return user.username;
  }

  @autobind
  private onGetSortKey(user: User): string {
    return user.fullname;
  }
}

export default withApollo(UserAutocomplete);
