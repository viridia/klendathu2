import AppsIcon from 'icons/ic_apps_black_24px.svg';
import * as React from 'react';
import NavItem from '../common/NavItem';

export default function DashboardNav() {
  return (
    <nav className="kdt left-nav">
      <NavItem icon={<AppsIcon />} title="Dashboard" exact={true} pathname="/" />
    </nav>
  );
}
