import { createAction } from 'redux-actions';

// All redux action ids.
export enum ActionId {
  CLEAR_SELECTION = 'CLEAR_SELECTION',
  DESELECT_ISSUES = 'DESELECT_ISSUES',
  SELECT_ISSUES = 'SELECT_ISSUES',
}

export const clearSelection = createAction(ActionId.CLEAR_SELECTION);
export const deselectIssues = createAction<number[]>(ActionId.DESELECT_ISSUES);
export const selectIssues = createAction<number[]>(ActionId.SELECT_ISSUES);
