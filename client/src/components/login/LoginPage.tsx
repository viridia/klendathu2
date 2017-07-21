import axios from 'axios';
import * as React from 'react';
import { ApolloClient, compose, withApollo } from 'react-apollo';
import { Button, ControlLabel, FormControl, FormGroup, HelpBlock } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import { withRouter } from 'react-router-dom';
import autobind from '../../lib/autobind';
import '../common/card.scss';
import Header from '../header/Header';
import './LoginPage.scss';

interface Props extends RouteComponentProps<{}> {
  client: ApolloClient;
}

interface State {
  userName: string;
  userNameError?: string;
  password: string;
  passwordError?: string;
}

class LoginPage extends React.Component<Props, State> {
  constructor() {
    super();
    this.state = {
      userName: '',
      userNameError: null,
      password: '',
      passwordError: null,
    };
  }

  public render() {
    const canSubmit = this.state.userName.length > 1 && this.state.password.length > 1;
    const { location } = this.props;
    // console.log('location', location);
    let nextUrl = '';
    if (location.state && location.state.next) {
      const loc = this.props.history.createHref(location.state.next);
      nextUrl = `?next=${encodeURIComponent(loc)}`;
    }
    return (
      <div className="kdt page">
        <Header location={this.props.location} />
        <div className="login-content">
          <div className="login-spacer-before" />
          <div className="login card">
            <form className="login-form" onSubmit={this.onSubmit}>
              <FormGroup
                  controlId="username"
                  validationState={this.state.userNameError ? 'error' : null}
              >
                <ControlLabel>User name</ControlLabel>
                <FormControl
                    type="text"
                    value={this.state.userName}
                    placeholder="Enter user name"
                    onChange={this.onChangeUserName}
                />
                <FormControl.Feedback />
                <HelpBlock>{this.state.userNameError}</HelpBlock>
              </FormGroup>
              <FormGroup
                  controlId="password"
                  validationState={this.state.passwordError ? 'error' : null}
              >
                <ControlLabel>Password</ControlLabel>
                <FormControl
                    type="password"
                    value={this.state.password}
                    placeholder="Enter password"
                    onChange={this.onChangePassword}
                    name="password"
                />
                <FormControl.Feedback />
                <HelpBlock>{this.state.passwordError}</HelpBlock>
              </FormGroup>
              <div className="button-row">
                <section>
                  <LinkContainer to={{ ...this.props.location, pathname: '/signup' }}>
                    <Button bsStyle="link">Create Account</Button>
                  </LinkContainer>
                  <LinkContainer to={{ ...this.props.location, pathname: '/recoverpw' }}>
                    <Button bsStyle="link">Forgot Password?</Button>
                  </LinkContainer>
                </section>
                <Button bsStyle="primary" type="submit" disabled={!canSubmit}>Sign In</Button>
              </div>
            </form>
            <div className="divider" />
            <div className="providers">
              <Button bsStyle="primary" href={`/auth/google${nextUrl}`}>Log in with Google</Button>
              <Button bsStyle="primary" href="/auth/github">Log in with Github</Button>
              <Button bsStyle="primary" href="/auth/other">Something else?</Button>
            </div>
          </div>
          <div className="login-spacer-after" />
        </div>
      </div>
    );
  }

  @autobind
  private onSubmit(ev: any) {
    ev.preventDefault();
    const errState: any = {
      userNameError: null,
      passwordError: null,
    };
    this.setState(errState);
    axios.post('/api/login', {
      username: this.state.userName,
      password: this.state.password,
    }).then(resp => {
      switch (resp.data.err) {
        case 'unknown-user': errState.userNameError = 'Unknown user.'; break;
        case 'incorrect-password': errState.passwordError = 'Incorrect password.'; break;
        default: {
          this.props.client.resetStore();
          const { next } = this.props.location.state || { next: undefined };
          localStorage.setItem('token', resp.data.token);
          // console.log('login successful', next, resp.data);
          this.props.history.push(next || { pathname: '/' });
          return;
        }
      }
      this.setState(errState);
    }, reason => {
      console.error('login error:', reason);
    });
  }

  @autobind
  private onChangeUserName(e: any) {
    this.setState({ userName: e.target.value });
  }

  @autobind
  private onChangePassword(e: any) {
    this.setState({ password: e.target.value });
  }
}

export default compose(
  withApollo,
  withRouter,
)(LoginPage);
