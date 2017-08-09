import { Location } from 'history';
import * as React from 'react';
import { Route } from 'react-router-dom';
import './Header.scss';
import NewIssueButton from './NewIssueButton';
import SignInLink from './SignInLink';
import UserMenuButton from './UserMenuButton';

interface Props {
  location: Location;
}

function Header(props: Props) {
  return (
    <header className="kdt header">
      <span className="title">Klendathu</span>
      <span className="subtitle">
        <span> - </span>
        &ldquo;in order to <em>fight</em> the bug, we must <em>understand</em> the bug.&rdquo;
      </span>
      <Route path="/project/:project" component={NewIssueButton} />
      <SignInLink {...props} />
      <UserMenuButton />
    </header>
  );
}

export default Header;
