import Axios from 'axios';
import autobind from 'bind-decorator';
import { History } from 'history';
import * as PropTypes from 'prop-types';
import * as React from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

interface Props {
  history: History;
}

export default class UserMenuButton extends React.Component<Props, undefined> {
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
    Axios.post('/api/logout').then(() => {
      localStorage.removeItem('token');
      this.props.history.push({ pathname: '/login' });
    });
  }
}
