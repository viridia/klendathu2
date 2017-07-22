import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import './components/defines/bootstrap.scss'; // Bootstrap styles
import Routes from './components/Routes';

interface RequireImport {
  default: any;
}

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
      <AppContainer>{Routes}</AppContainer>,
      document.getElementById('react-root'));
  if (module.hot) {
    module.hot.accept('./components/Routes', () => {
      const nextRoutes = require<RequireImport>('./components/Routes').default;
      ReactDOM.render(
          <AppContainer>{nextRoutes}</AppContainer>,
          document.getElementById('react-root'));
    });
  }
});
