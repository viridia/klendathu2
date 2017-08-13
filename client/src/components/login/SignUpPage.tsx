import axios from 'axios';
import autobind from 'bind-decorator';
import * as React from 'react';
import { ApolloClient, withApollo } from 'react-apollo';
import { Button, ControlLabel, FormControl, FormGroup, HelpBlock } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import Header from '../header/Header';
import './LoginPage.scss';

interface Props extends RouteComponentProps<{}> {
  client: ApolloClient;
}

interface State {
  username: string;
  usernameError?: string;
  fullName: string;
  fullNameError?: string;
  email: string;
  emailError?: string;
  password: string;
  passwordError?: string;
  password2: string;
  password2Error?: string;
}

class SignUpPage extends React.Component<Props, State> {
  constructor() {
    super();
    this.state = {
      username: '',
      usernameError: null,
      fullName: '',
      fullNameError: null,
      email: '',
      emailError: null,
      password: '',
      passwordError: null,
      password2: '',
      password2Error: null,
    };
  }

  public render() {
    const { next } = this.props.location.state || { next: undefined };
    // console.log('next:', next);
    const {
      username,
      usernameError,
      fullName,
      fullNameError,
      email,
      emailError,
      password,
      passwordError,
      password2,
      password2Error,
    } = this.state;
    const canSubmit =
        username.length > 0 && email.length > 0 && password.length > 0 && password2.length > 0;
    return (
      <div className="kdt page">
        <Header location={this.props.location} history={this.props.history} />
        <div className="login-content">
          <div className="login-spacer-before" />
          <div className="login card">
            <form className="login-form" onSubmit={this.onSubmit}>
              <FormGroup controlId="username" validationState={usernameError ? 'error' : null}>
                <ControlLabel>Username</ControlLabel>
                <FormControl
                    type="text"
                    value={username}
                    placeholder="Choose a user name"
                    onChange={this.onChangeUserName}
                />
                <FormControl.Feedback />
                <HelpBlock>{usernameError}</HelpBlock>
              </FormGroup>
              <FormGroup controlId="name" validationState={fullNameError ? 'error' : null}>
                <ControlLabel>Your full name</ControlLabel>
                <FormControl
                    type="text"
                    value={fullName}
                    placeholder="Enter your full name"
                    onChange={this.onChangeFullName}
                />
                <FormControl.Feedback />
                <HelpBlock>{fullNameError}</HelpBlock>
              </FormGroup>
              <FormGroup controlId="email" validationState={emailError ? 'error' : null}>
                <ControlLabel>Email</ControlLabel>
                <FormControl
                    type="text"
                    value={email}
                    placeholder="Enter email address"
                    onChange={this.onChangeEmail}
                />
                <FormControl.Feedback />
                <HelpBlock>{emailError}</HelpBlock>
              </FormGroup>
              <FormGroup controlId="password" validationState={passwordError ? 'error' : null}>
                <ControlLabel>Password</ControlLabel>
                <FormControl
                    type="password"
                    value={password}
                    placeholder="Choose a password"
                    onChange={this.onChangePassword}
                />
                <FormControl.Feedback />
                <HelpBlock>{passwordError}</HelpBlock>
              </FormGroup>
              <FormGroup
                  controlId="confirm_password"
                  validationState={password2Error ? 'error' : null}
              >
                <ControlLabel>Confirm Password</ControlLabel>
                <FormControl
                    type="password"
                    value={password2}
                    placeholder="Re-enter your password"
                    onChange={this.onChangePassword2}
                />
                <FormControl.Feedback />
                <HelpBlock>{password2Error}</HelpBlock>
              </FormGroup>
              <div className="button-row">
                <LinkContainer to={{ ...this.props.location, pathname: '/login' }}>
                  <Button bsStyle="link">Sign In</Button>
                </LinkContainer>
                <LinkContainer to={next || { pathname: '/' }}>
                  <Button bsStyle="default">Cancel</Button>
                </LinkContainer>
                <Button bsStyle="primary" type="submit" disabled={!canSubmit}>
                  Create Account
                </Button>
              </div>
            </form>
          </div>
          <div className="login-spacer-after" />
        </div>
      </div>
    );
  }

  @autobind
  private onSubmit(ev: any) {
    ev.preventDefault();
    axios.post('/api/signup', {
      username: this.state.username,
      fullname: this.state.fullName,
      email: this.state.email,
      password: this.state.password,
      password2: this.state.password2,
    }).then(resp => {
      const errState: any = {
        usernameError: null,
        fullNameError: null,
        emailError: null,
        passwordError: null,
        password2Error: null,
      };
      switch (resp.data.err) {
        case 'username-too-short':
          errState.usernameError = 'User name must be at least 6 characters.';
          break;
        case 'username-lower-case':
          errState.usernameError = 'User name cannot contain capital letters.';
          break;
        case 'user-exists': errState.usernameError = 'User name not available.'; break;
        case 'invalid-name': errState.nameError = 'Invalid name.'; break;
        case 'invalid-email': errState.emailError = 'Invalid email address.'; break;
        case 'invalid-password': errState.passwordError = 'Invalid password.'; break;
        case 'password-match':
          errState.password2Error = 'Confirmation password does not match.';
          break;
        case 'password-too-short':
          errState.password2Error = 'Password must be at least 5 characters.';
          break;
        default: {
          this.props.client.resetStore();
          const { next } = this.props.location.state || { next: undefined };
          this.props.history.push(next || '/');
          return;
        }
      }
      this.setState(errState);
    }, reason => {
      console.error('signup error:', reason);
    });
  }

  @autobind
  private onChangeFullName(e: any) {
    this.setState({ fullName: e.target.value });
  }

  @autobind
  private onChangeUserName(e: any) {
    this.setState({ username: e.target.value });
  }

  @autobind
  private onChangeEmail(e: any) {
    this.setState({ email: e.target.value });
  }

  @autobind
  private onChangePassword(e: any) {
    this.setState({ password: e.target.value });
  }

  @autobind
  private onChangePassword2(e: any) {
    this.setState({ password2: e.target.value });
  }
}

export default withApollo(SignUpPage);
