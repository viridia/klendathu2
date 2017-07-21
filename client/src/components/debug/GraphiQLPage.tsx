import 'graphiql/graphiql.css';
import * as React from 'react';

const GraphiQL = require('graphiql');

function graphQLFetcher(graphQLParams: any) {
  return window.fetch('/api/graphql', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(graphQLParams),
    credentials: 'same-origin',
  }).then(response => response.json());
}

export default class GraphQLPage extends React.Component {
  public render() {
    return <GraphiQL fetcher={graphQLFetcher} />;
  }
}
