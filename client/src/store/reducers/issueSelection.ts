import * as Immutable from 'immutable';
import { Action, handleActions } from 'redux-actions';
import { ActionId } from '../actions';

export type IssueIdSet = Immutable.Set<number>;

const initialState: IssueIdSet = Immutable.Set<number>();

const issueSelectionReducer = handleActions<IssueIdSet>({
  [ActionId.CLEAR_SELECTION]: (state: IssueIdSet) => initialState,
  [ActionId.DESELECT_ISSUES]:
    (state: IssueIdSet, action: Action<number[]>) => state.subtract(action.payload),
  [ActionId.SELECT_ISSUES]:
    (state: IssueIdSet, action: Action<number[]>) => state.union(action.payload),
}, initialState);

export default issueSelectionReducer;
