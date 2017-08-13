import { FieldType, Issue, Project, ProjectPrefs, Template, Workflow } from 'common/api';
import * as Immutable from 'immutable';
import * as qs from 'qs';
import * as React from 'react';
import { compose, DefaultChildProps, graphql, withApollo } from 'react-apollo';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
// import { bindActionCreators } from 'redux';
// import equal from 'deep-equal';
import ErrorDisplay from '../debug/ErrorDisplay';
// import FilterParams from '../filters/filterParams.jsx';
import MassEdit from '../massedit/MassEdit';
import IssueList from './IssueList';
// import { setFilterTerms } from '../../store/filter';
// import { getFieldType } from '../filters/fieldTypes';

import * as IssueListQuery from '../../graphql/queries/issueList.graphql';

interface OwnProps extends RouteComponentProps<{}> {
  project: Project;
  template: Template;
  workflow: Workflow;
}

interface StateProps {
  selection: Immutable.Set<number>;
}

type Props = OwnProps;

interface Data {
  issues: Issue[];
  projectPrefs: ProjectPrefs;
}

interface QueryParams {
  type?: string;
  state?: string;
  summary?: string;
  summaryPred?: string;
  description?: string;
  descriptionPred?: string;
  labels?: string[];
  owner?: string;
  reporter?: string;
  search?: string;
  sort?: string;
  subtasks?: boolean;
}

function parseQueryParams(query: string, workflow: Workflow): QueryParams {
  const { label, type, state, sort, subtasks, ...params } = qs.parse(query ? query.slice(1) : '');
  return {
    ...params,
    type: type && type.split(','),
    state: (state && state !== 'open') ? state.split(',') : defaultStates(workflow),
    labels: label && label.split(','),
    sort: [sort || '-updated'],
    subtasks: subtasks !== undefined,
    // project: project.id,
    // search,
    // cc: undefined,
    // comment: undefined,
    // commentPred: undefined,
    // custom,
  };
}

// IssueListView.propTypes = {
//   location: PropTypes.shape({
//     pathname: PropTypes.string.isRequired,
//     query: PropTypes.shape({
//       type: PropTypes.string,
//       state: PropTypes.string,
//       summary: PropTypes.string,
//       summaryPred: PropTypes.string,
//       description: PropTypes.string,
//       descriptionPred: PropTypes.string,
//       labels: PropTypes.string,
//       owner: PropTypes.string,
//       reporter: PropTypes.string,
//     }),
//   }).isRequired,
//   setFilterTerms: PropTypes.func.isRequired,
// };
//
// IssueListView.contextTypes = {
//   profile: PropTypes.shape({}),
// };

class IssueListView extends React.Component<DefaultChildProps<Props, Data>, undefined> {
  private defaultColumns: string[];
  private hotlist: Immutable.Set<number>;

  constructor(props: DefaultChildProps<Props, Data>, context: any) {
    super(props, context);
  //   this.query = new Immutable.Map(props.location.query || {});
    this.hotlist = this.hotlistSet(props);
    this.defaultColumns = ['updated', 'type', 'owner', 'state'];
  }

  // componentWillMount() {
  //   this.parseQuery();
  // }

  public componentWillReceiveProps(nextProps: DefaultChildProps<Props, Data>) {
    // const query = new Immutable.Map(nextProps.location.query || {});
    // if (!Immutable.is(this.query, query)) {
    //   this.query = query;
    //   this.parseQuery();
    // }
    this.hotlist = this.hotlistSet(nextProps);
  }

  // shouldComponentUpdate(nextProps) {
  //   return this.props.data.issues !== nextProps.data.issues
  //       || this.props.data.loading !== nextProps.data.loading
  //       || this.props.project !== nextProps.project
  //       || !equal(this.props.data.error, nextProps.data.error)
  //       || !equal(this.props.location, nextProps.location);
  // }

  public render() {
    if (this.props.data.error) {
      return <ErrorDisplay error={this.props.data.error} />;
    }
    const { issues } = this.props.data;
    const columns = (this.props.data && this.props.data.projectPrefs &&
        this.props.data.projectPrefs.columns) || this.defaultColumns;
    // return (<section className="kdt issue-list">
    //   <FilterParams {...this.props} query={this.query.get('search')} />
    // </section>);
    return (
      <section className="kdt issue-list">
        <MassEdit {...this.props} issues={issues} />
        <IssueList
            {...this.props}
            issues={issues}
            labels={this.hotlist}
            columns={columns}
            loading={this.props.data.loading}
        />
      </section>
    );
  }

  // parseQuery() {
  //   // What this code does is update the list of terms from the current query params, and does
  //   // it in a way that preserves the order of the query terms.
  //   const context = {
  //     client: this.props.client,
  //     project: this.props.project,
  //     profile: this.context.profile,
  //   };
  //   const filterTerms = [];
  //   for (const field of this.query.keys()) {
  //     const term = getFieldType(context.project, field);
  //     if (term) {
  //       const newTerm = { ...term.parseQuery(this.query, context), field };
  //       if (newTerm !== null) {
  //         filterTerms.push(Promise.resolve(newTerm));
  //       }
  //     }
  //   }
  //   Promise.all(filterTerms).then(terms => {
  //     this.props.setFilterTerms(new Immutable.List(terms));
  //   });
  // }

  private hotlistSet(props: DefaultChildProps<Props, Data>): Immutable.Set<number> {
    if (props.data && props.data.projectPrefs) {
      const labels = props.data.projectPrefs.labels || [];
      return Immutable.Set<number>(labels);
    }
    return Immutable.Set();
  }
}

function defaultStates(workflow: Workflow) {
  // Default behavior is to show 'open' states.
  return workflow.states.filter(st => !st.closed).map(st => st.id);
}

function findCustomField(template: Template, fieldName: string): FieldType | null {
  for (const type of template.types) {
    const field = type.fields.find(f => f.id === fieldName);
    if (field) {
      return field;
    }
  }
  return null;
}

export default compose(
  graphql(IssueListQuery, {
    options: ({ project, template, workflow, location }: Props) => {
      const query = qs.parse(location.search);
      const {
        type, state,
        summary, summaryPred,
        description, descriptionPred,
        labels, search: search,
        owner, reporter,
        sort, subtasks,
        ...other,
      } = parseQueryParams(location.search, workflow);
      // Handle custom search
      const custom = [];
      for (const key of Object.keys(other)) {
        if (key.startsWith('custom.')) {
          const customFieldName = key.slice(7);
          const customField = findCustomField(template, customFieldName);
          if (customField) {
            if (customField.type === 'ENUM') {
              custom.push({
                name: customFieldName,
                values: query[key].split(','),
              });
            } else if (customField.type === 'TEXT') {
              custom.push({
                name: customFieldName,
                value: query[key],
              });
            }
          }
        }
      }
      return {
        variables: {
          project: project.id,
          search,
          type,
          state,
          summary,
          summaryPred,
          description,
          descriptionPred,
          reporter,
          owner,
          cc: undefined,
          labels,
          comment: undefined,
          commentPred: undefined,
          custom,
          sort,
          subtasks,
        },
      };
    },
  }),
  connect<StateProps, {}, OwnProps>(
    state => ({
      selection: state.issueSelection,
    }),
    // dispatch => bindActionCreators({ setFilterTerms }, dispatch),
  ),
  withApollo,
)(IssueListView);
