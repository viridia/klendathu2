// import Perf from 'react-addons-perf';
// import 'react-redux-toastr/src/less/index.less';
// import * as Immutable from 'immutable';
import { Project } from 'common/api';
import * as PropTypes from 'prop-types';
import * as React from 'react';
import { compose, DefaultChildProps, graphql } from 'react-apollo';
import { DragDropContext } from 'react-dnd';
import * as HTML5Backend from 'react-dnd-html5-backend';
import {
  Route,
  RouteComponentProps,
  Switch,
} from 'react-router-dom';
import ErrorDisplay from '../debug/ErrorDisplay';
import LeftNav from '../nav/LeftNav';
// import { ProjectContent } from '../store/fragments';

const ProjectQuery = require('../../graphql/queries/project.graphql');
const equal = require('deep-equal');

type Props = RouteComponentProps<{ project: string }>;

interface Data {
  project: Project;
}

class ProjectView extends React.Component<DefaultChildProps<Props, Data>, undefined> {
  public static contextTypes = {
    profile: PropTypes.shape({
      username: PropTypes.string.isRequired,
    }),
  };

  private cachedProject: Project;

  constructor(props: DefaultChildProps<Props, Data>) {
    super(props);
    this.cachedProject = props.data.project;
    this.buildProjectMaps();
    // React performance measurement
    // Perf.start();
  }

  // componentDidMount() {
    // setTimeout(() => {
    //   Perf.stop();
    //   Perf.printWasted(Perf.getLastMeasurements());
    // }, 1000);
  // }

  public componentWillReceiveProps(nextProps: DefaultChildProps<Props, Data>) {
    // Make sure that project pointer doesn't change unless value does. Allows shallow compares.
    if (!equal(this.cachedProject, nextProps.data.project)) {
      this.cachedProject = nextProps.data.project;
      this.buildProjectMaps();
    }
  }

  public render() {
    const { data: { error, loading } } = this.props;
    const project = this.cachedProject;
    if (error) {
      return <ErrorDisplay error={error} />;
    } else if (loading) {
      return <div className="content" />;
    } else if (!this.context.profile) {
      return <div className="content">Profile not loaded</div>;
    } else if (!project) {
      return <div className="content">Project not found</div>;
    }
    // const main = React.cloneElement(child, { project, params });
    return (
      <div className="content">
        <LeftNav project={project} />
        <Switch>
          <Route path="/project/:project/new" />
          <Route path="/project/:project/edit/:id" />
          <Route path="/project/:project/issues/:id" />
          <Route path="/project/:project/issues" exact={true} />
          <Route path="/project/:project/labels" />
          <Route path="/project/:project/settings" />
          <Route path="/project/:project" />
        </Switch>
      </div>
    );
  }

  private buildProjectMaps() {
    const project = this.cachedProject;
    if (project) {
      // TODO: figure out what we're going to do w/r/t fetching templates and workflows.
      // Add map of types by id
      if (project.template) {
//         project.template.typesById = Immutable.Map(project.template.types.map(t => [t.id, t]));
//         const fieldsById = new Map();
//         const fieldList = [];
//         project.template.types.forEach(t => {
//           if (t.fields) {
//             t.fields.forEach(f => {
//               fieldsById.set(f.id, f);
//               fieldList.push([f.caption, f.id]);
//             });
//           }
// ``        });
//         fieldList.sort();
//         project.template.customFieldsById = new Immutable.Map(fieldsById);
//         project.template.customFieldList = new Immutable.List(fieldList);
      }
      // Add map of states by id
      // if (project.workflow) {
      //   project.workflow.statesById = Immutable.Map(project.workflow.states.map(s => [s.id, s]));
      // }
    }
  }
}

export default compose(
  DragDropContext(HTML5Backend),
  graphql(ProjectQuery, {
    options: (props: Props) => ({
      variables: { project: props.match.params.project },
      // fragments: [ProjectContent],
    }),
  },
)(ProjectView)) as any;
