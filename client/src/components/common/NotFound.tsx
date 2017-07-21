import * as React from 'react';
import DashboardNav from '../dashboard/DashboardNav';

export default class NotFound extends React.Component {
  public render() {
    return (
      <div className="kdt page">
        <DashboardNav />
        <section>
          Page not found.
        </section>
      </div>
    );
  }
}
