import * as React from 'react';
import { ApolloProvider } from 'react-apollo';
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';
import apollo from '../store/apollo';
import store from '../store/store';
import LoginPage from './login/LoginPage';
import SignUpPage from './login/SignUpPage';
import MainPage from './main/MainPage';

export default (
  <ApolloProvider store={store} client={apollo}>
    <Router>
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/signup" component={SignUpPage} />
        <Route path="/finishsignup" />
        <Route path="/recoverpw" />
        <Route path="/resetpw" />
        <Route path="/" component={MainPage} />
      </Switch>
    </Router>
  </ApolloProvider>
);
