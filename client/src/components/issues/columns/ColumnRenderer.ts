import { Issue } from 'common/api';

export default interface ColumnRenderer {
  renderHeader(
    sort: string,
    descending: boolean,
    onChangeSort: (column: string, descending: boolean) => void): void;

  render(issue: Issue): void;
}
