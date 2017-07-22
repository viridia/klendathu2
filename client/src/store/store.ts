import { applyMiddleware, createStore } from 'redux';
import reduxThunk from 'redux-thunk';
// import { reducer as toastrReducer } from 'react-redux-toastr';
// import filterReducer from './filter';
import apollo from './apollo';
import reducers from './reducers';

const store = createStore(reducers, applyMiddleware(reduxThunk, apollo.middleware()));

if (module.hot) {
  // Enable Webpack hot module replacement for reducers
  module.hot.accept('./reducers', () => {
    const nextRootReducer = require('./reducers/index');
    store.replaceReducer(nextRootReducer as any);
  });
}
export default store;
