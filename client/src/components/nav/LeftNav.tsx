import { Project, ProjectPrefs, Role } from 'common/api';
import AppsIcon from 'icons/ic_apps_black_24px.svg';
import BookmarkIcon from 'icons/ic_bookmark_border_black_24px.svg';
import ListIcon from 'icons/ic_list_black_24px.svg';
import LocalOfferIcon from 'icons/ic_local_offer_black_24px.svg';
import PersonIcon from 'icons/ic_person_black_24px.svg';
import SettingsIcon from 'icons/ic_settings_black_24px.svg';
import * as qs from 'qs';
import * as React from 'react';
import { DefaultChildProps, graphql } from 'react-apollo';
import { NavLink } from 'react-router-dom';
import LabelName from '../common/LabelName';
import NavItem from '../common/NavItem';
import './LeftNav.scss';

const LeftNavDataQuery  = require('../../graphql/queries/leftNavData.graphql');
const equal = require('deep-equal');

interface Props {
  project: Project;
}

interface Data {
  projectPrefs: ProjectPrefs;
  projects: Project[];
}

class LeftNav extends React.Component<DefaultChildProps<Props, Data>, undefined> {
  public shouldComponentUpdate(nextProps: DefaultChildProps<Props, Data>) {
    return this.props.project.id !== nextProps.project.id
        || this.props.project.name !== nextProps.project.name
        || this.props.data.loading !== nextProps.data.loading
        || !equal(this.props.data.projectPrefs, nextProps.data.projectPrefs);
  }

  public render() {
    const { project } = this.props;
    const { projects, projectPrefs } = this.props.data;
    const filters = projectPrefs ? projectPrefs.filters : [];
    const labels = projectPrefs ? projectPrefs.labelProps : [];
    const isProjectMember = project.role >= Role.VIEWER;
    return (
      <nav className="kdt left-nav">
        <NavItem
            icon={<ListIcon />}
            title="All Issues"
            pathname={`/project/${project.name}/issues`}
            query={{ owner: undefined, label: undefined, type: undefined, state: undefined }}
        />
        {isProjectMember && <NavItem
            icon={<PersonIcon />}
            title="My Open Issues"
            pathname={`/project/${project.name}/issues`}
            query={{ owner: 'me', state: 'open' }}
        />}
        {isProjectMember && <NavItem
            icon={<LocalOfferIcon />}
            title="Labels"
            pathname={`/project/${project.name}/labels`}
        />}
        {isProjectMember && labels && labels.length > 0 && <ul className="label-list">
          {labels.map(label => (
            <li className="label-item" key={label.id}>
              <NavLink
                  to={{
                    pathname: `/project/${project.name}/issues`,
                    search: qs.stringify({ label: label.id }) }}
              >
                <LabelName label={label.id} project={project.id} />
              </NavLink>
            </li>
          ))}
        </ul>}
        {isProjectMember && <NavItem
            icon={<BookmarkIcon />}
            title="Saved Filters"
            pathname={`/project/${project.name}/queries`}
        />}
        {isProjectMember && filters && filters.length > 0 && <ul className="filter-list">
          {filters.map(filter => (
            <li className="filter-item" key={filter.name}>
              <NavLink
                  to={{
                    pathname: `/project/${project.name}/issues`,
                    search: filter.value }}
              >
                {filter.name}
              </NavLink>
            </li>
          ))}
        </ul>}
        {isProjectMember && <NavItem
            icon={<SettingsIcon />}
            title="Project Settings"
            pathname={`/project/${project.name}/settings`}
        />}
        <NavItem icon={<AppsIcon />} title="Projects" exact={true} pathname="/" />
        {projects && projects.length > 0 && <ul className="project-list">
          {projects.map(p => (
            <li className="project-item" key={p.name}>
              <NavLink activeClassName="active" to={{ pathname: `/project/${p.name}/issues` }}>
                {p.name}
              </NavLink>
            </li>
          ))}
        </ul>}
      </nav>
    );
  }
}

export default graphql(LeftNavDataQuery, {
  options: ({ project }: Props) => ({ variables: { project: project.id } }),
})(LeftNav);
