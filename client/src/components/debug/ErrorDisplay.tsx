import * as React from 'react';
import autobind from '../../lib/autobind';
import './ErrorDisplay.scss';

interface Props {
  error: any;
}

export default class ErrorDisplay extends React.Component<Props, undefined> {
  public render() {
    const { error } = this.props;
    console.error(error);
    if (error.networkError) {
      return this.renderError(error.networkError);
    } else if (error.graphQLErrors) {
      return (
        <section className="error-display">
          {error.graphQLErrors.map(this.renderGQLError)}
        </section>
      );
    }
    return (
      <section className="error-display">
        {error.message}
      </section>
    );
  }

  private renderError(error: any) {
    // console.log('stack:', error.stack);
    return (
      <section className="error-display">
        <pre>{error.message}</pre>
        <pre className="stack">
          {error.stack}
        </pre>
      </section>
    );
  }

  @autobind
  private renderGQLError(error: any, index: number) {
    return (
      <div key={index}>
        {error.details && <pre>{error.details.error}</pre>}
        {error.message && <pre>{error.message}</pre>}
        <pre className="stack">
          {error.stack}
        </pre>
      </div>
    );
  }
}
