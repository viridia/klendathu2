// import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './components/defines/bootstrap.scss'; // Bootstrap styles
import Routes from './components/Routes';

interface RequireImport {
  default: any;
}

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(Routes, document.getElementById('react-root'));
  if (module.hot) {
    module.hot.accept('./components/Routes', () => {
      const nextRoutes = require<RequireImport>('./components/Routes').default;
      ReactDOM.render(nextRoutes, document.getElementById('react-root'));
    });
  }
});
