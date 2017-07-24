import 'graphiql/graphiql.css';
import * as React from 'react';

const GraphiQL = require('graphiql');

function graphQLFetcher(graphQLParams: any) {
  const token = localStorage.getItem('token');
  return window.fetch('/api/graphql', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      authorization: token ? `JWT ${token}` : undefined,
    },
    body: JSON.stringify(graphQLParams),
    credentials: 'same-origin',
  }).then(response => response.json());
}

export default class GraphQLPage extends React.Component {
  public render() {
    return <GraphiQL fetcher={graphQLFetcher} />;
  }
}
