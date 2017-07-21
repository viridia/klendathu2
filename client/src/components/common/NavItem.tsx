import * as qs from 'qs';
import * as React from 'react';
import { NavLink } from 'react-router-dom';

interface Props {
  icon: JSX.Element;
  title: string | JSX.Element;
  pathname: string;
  query?: any;
  exact?: boolean;
}

export default function NavItem({
    title,
    icon,
    pathname,
    query,
    exact = false }: Props) {
  return (
    <NavLink
      className="item"
      activeClassName="active"
      exact={exact}
      to={{ pathname, search: qs.stringify(query) }}
    >
      {icon}{title}
    </NavLink>
  );
}
