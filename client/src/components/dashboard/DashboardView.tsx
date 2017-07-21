import * as React from 'react';
import Dashboard from './Dashboard';
import DashboardNav from './DashboardNav';

export default function DashboardView() {
  return (
    <div className="content">
      <DashboardNav />
      <Dashboard />
    </div>
  );
}
