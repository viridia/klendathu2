import { applyMiddleware, combineReducers, createStore } from 'redux';
import reduxThunk from 'redux-thunk';
// import { reducer as toastrReducer } from 'react-redux-toastr';
// import workflowsReducer from './workflows';
// import filterReducer from './filter';
// import issueSelectionReducer from './issueSelection';
import apollo from './apollo';

const store = createStore(combineReducers({
  // toastr: toastrReducer,
  // filter: filterReducer,
  // issueSelection: issueSelectionReducer,
  // workflows: workflowsReducer,
  apollo: apollo.reducer(),
}), applyMiddleware(reduxThunk, apollo.middleware()));

export default store;
