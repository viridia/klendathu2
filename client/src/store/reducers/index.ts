import { combineReducers } from 'redux';
// import { reducer as toastrReducer } from 'react-redux-toastr';
// import workflowsReducer from './workflows';
// import filterReducer from './filter';
// import issueSelectionReducer from './issueSelection';
import apollo from '../apollo';

export default combineReducers({
  // toastr: toastrReducer,
  // filter: filterReducer,
  // issueSelection: issueSelectionReducer,
  // workflows: workflowsReducer,
  apollo: apollo.reducer(),
});
