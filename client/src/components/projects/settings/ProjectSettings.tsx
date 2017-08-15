import autobind from 'bind-decorator';
import { Project, Role, Template, Workflow } from 'common/api';
import * as React from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import ColumnSettings from './columns/ColumnSettings';
import ProjectMemberList from './members/ProjectMemberList';
import ProjectInfoEdit from './ProjectInfoEdit';
// import ProjectTemplateEdit from '../projects/ProjectTemplateEdit.jsx';
// import WorkflowEdit from '../workflow/workflowEdit.jsx';
import './settings.scss';

interface Props extends RouteComponentProps<{ tab?: string }> {
  project: Project;
  template: Template;
  workflow: Workflow;
}

// TODO: finish
export default class ProjectSettings extends React.Component<Props> {
  public render() {
    const { project, match } = this.props;
    if (!project) {
      return <section className="kdt project-settings" />;
    }
    const activeKey = match.params.tab || 'info';
    return (
      <section className="kdt project-settings">
        <header>Project settings</header>
        <Tabs
            activeKey={activeKey}
            onSelect={this.handleSelect}
            animation={false}
            id="project-panel"
        >
          <Tab eventKey="info" title="Project Info">
            <ProjectInfoEdit {...this.props} />
          </Tab>
          <Tab eventKey="columns" title="Columns">
            <ColumnSettings {...this.props} />
          </Tab>
          <Tab eventKey="members" title="Members">
            <ProjectMemberList {...this.props} />
          </Tab>
          {project.role >= Role.MANAGER && (<Tab eventKey="templates" title="Issue Templates">
            {/* <ProjectTemplateEdit {...this.props} /> */}
          </Tab>)}
          {project.role >= Role.MANAGER && (<Tab eventKey="workflow" title="Workflow">
            {/* <WorkflowEdit {...this.props} /> */}
          </Tab>)}
        </Tabs>
      </section>
    );
  }

  @autobind
  private handleSelect(selected: any) {
    this.props.history.push({
      pathname: `/project/${this.props.project.name}/settings/${selected}`,
    });
  }
}
