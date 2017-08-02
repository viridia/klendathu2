import autobind from 'bind-decorator';
// import axios from 'axios';
import * as PropTypes from 'prop-types';
import * as React from 'react';
// import { withApollo } from 'react-apollo';
import { DropdownButton, MenuItem } from 'react-bootstrap';
// import { browserHistory } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';

// TODO: implement
// interface Props {
//   data?: {};
//   // client: React.PropTypes.instanceOf(ApolloClient).isRequired,
//   // client?: any;
//
// }

class UserMenuButton extends React.Component<undefined, undefined> {
  public static contextTypes = {
    profile: PropTypes.shape({}),
  };

  public render() {
    const { profile } = this.context;
    if (!profile || !profile.username) {
      return null;
    }
    return (
      <DropdownButton bsStyle="primary" title={profile.username} id="user-menu" pullRight={true}>
        <LinkContainer to={{ pathname: '/' }} exact={true}>
          <MenuItem eventKey="dashboard">Dashboard</MenuItem>
        </LinkContainer>
        <LinkContainer to={{ pathname: '/profile' }}>
          <MenuItem eventKey="profile">Your Profile</MenuItem>
        </LinkContainer>
        <MenuItem divider={true} />
        <MenuItem eventKey="4" onClick={this.onSignOut}>Sign out</MenuItem>
      </DropdownButton>
    );
  }

  @autobind
  private onSignOut(e: React.MouseEvent<{}>): void {
    e.preventDefault();
    // TODO: finish
    // axios.post('logout').then(() => {
    //   this.props.client.resetStore();
    //   browserHistory.push({ pathname: '/login' });
    // });
  }
}

// export default withApollo(UserMenuButton);
export default UserMenuButton;
