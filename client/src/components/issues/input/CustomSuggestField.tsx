import autobind from 'bind-decorator';
import { FieldType, Project } from 'common/api';
import * as React from 'react';
import { ApolloClient, withApollo } from 'react-apollo';
import Autocomplete, { SearchCallback } from '../../ac/Autocomplete';

import * as SearchCustomFieldsQuery from '../../../graphql/queries/searchCustomFields.graphql';

function escapeRegExp(str: string) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

interface Props {
  project: Project;
  field: FieldType;
  value: string;
  client: ApolloClient;
  onChange: (id: string, value: string) => void;
  onEnter: () => void;
}

// onGetSortKey={this.onGetSortKey}

class CustomSuggestField extends React.Component<Props> {
  private reList: RegExp[];

  // allowNew={true}
  public render() {
    const { field, value } = this.props;
    return (
      <Autocomplete
          className="keywords ac-multi"
          value={value}
          maxLength={field.maxLength}
          onSearch={this.onSearch}
          onEnter={this.props.onEnter}
          onGetValue={this.onGetValue}
          onRenderSuggestion={this.onRenderSuggestion}
          onChange={this.onChangeValue}
      />
    );
  }

  @autobind
  private onSearch(search: string, callback: SearchCallback) {
    if (search.length < 1) {
      callback([]);
    } else {
      const terms = search.split(/\s+/);
      this.reList = terms.map(term => new RegExp(`(^|\\s)${escapeRegExp(term)}`, 'i'));
      this.props.client.query<{ searchCustomFields: string[] }>({
        query: SearchCustomFieldsQuery,
        variables: {
          search,
          field: this.props.field.id,
          project: this.props.project.id,
        },
      }).then(resp => {
        callback(resp.data.searchCustomFields);
      });
    }
  }

  @autobind
  private onRenderSuggestion(text: string) {
    const tlist = [text];
    for (const re of this.reList) {
      for (let i = 0; i < tlist.length; i += 2) {
        const split = this.highlightMatches(re, tlist[i]);
        if (split !== null) {
          tlist.splice(i, 1, ...split);
          break;
        }
      }
    }
    const parts: JSX.Element[] = [];
    tlist.forEach((tx, i) => {
      if (i % 2) {
        parts.push(<strong key={i}>{tx}</strong>);
      } else if (tx.length > 0) {
        parts.push(<span key={i}>{tx}</span>);
      }
    });
    return <span className="suggestion">{parts}</span>;
  }

  @autobind
  private onGetValue(text: string) {
    return text;
  }

  // @autobind
  // private onGetSortKey(text: string) {
  //   return text;
  // }

  @autobind
  private onChangeValue(value: string) {
    this.props.onChange(this.props.field.id, value);
  }

  private highlightMatches(re: RegExp, str: string) {
    const m = str.match(re);
    if (m) {
      const mtext = m[0];
      return [
        str.slice(0, m.index),
        mtext,
        str.slice(m.index + mtext.length),
      ];
    }
    return null;
  }
}

export default withApollo(CustomSuggestField);
