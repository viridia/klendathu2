import { Project } from 'common/api';
import * as React from 'react';
import { DefaultChildProps, graphql } from 'react-apollo';
import ErrorDisplay from '../debug/ErrorDisplay';
import ProjectCard from './ProjectCard';

import * as ProjectListQuery from '../../graphql/queries/projectList.graphql';

interface Data {
  projects: Project[];
}

class ProjectList extends React.Component<DefaultChildProps<undefined, Data>, undefined> {
  public render() {
    const { projects, loading, error } = this.props.data;
    if (error) {
      return <ErrorDisplay error={error} />;
    } else if (loading || !projects) {
      return <div className="project-list" />;
    }
    return (
      <div className="project-list">
        {projects.map(p => <ProjectCard project={p} key={p.name} />)}
      </div>
    );
  }
}

export default graphql(ProjectListQuery)(ProjectList);
