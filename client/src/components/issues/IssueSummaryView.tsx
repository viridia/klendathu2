import { Project } from 'common/api';
import * as React from 'react';
import {
  RouteComponentProps,
} from 'react-router-dom';
// import { connect } from 'react-redux';
// import { bindActionCreators, compose } from 'redux';
// import Immutable from 'immutable';
// import { graphql, withApollo } from 'react-apollo';
// import ApolloClient from 'apollo-client';
// import equal from 'deep-equal';
// import ErrorDisplay from '../debug/errorDisplay.jsx';
// import FilterParams from '../filters/filterParams.jsx';
// import MassEdit from '../filters/massEdit.jsx';
// import IssueList from './issueList.jsx';
// import * as IssueListQuery from '../../graphql/queries/issueList.graphql';
// import { setFilterTerms } from '../../store/filter';
// import { getFieldType } from '../filters/fieldTypes';

interface Props extends RouteComponentProps<{}> {
  project: Project;
}

class IssueSummaryView extends React.Component<Props, undefined> {
  // constructor(props, context) {
  //   super(props, context);
  //   this.query = new Immutable.Map(props.location.query || {});
  //   this.hotlist = this.hotlistSet(props);
  //   this.defaultColumns = ['updated', 'type', 'owner', 'state'];
  // }

  // componentWillMount() {
  //   this.parseQuery();
  // }
  //
  // componentWillReceiveProps(nextProps) {
  //   const query = new Immutable.Map(nextProps.location.query || {});
  //   if (!Immutable.is(this.query, query)) {
  //     this.query = query;
  //     this.parseQuery();
  //   }
  //   this.hotlist = this.hotlistSet(nextProps);
  // }
  //
  // shouldComponentUpdate(nextProps) {
  //   return this.props.data.issues !== nextProps.data.issues
  //       || this.props.data.loading !== nextProps.data.loading
  //       || this.props.project !== nextProps.project
  //       || !equal(this.props.data.error, nextProps.data.error)
  //       || !equal(this.props.location, nextProps.location);
  // }
  //
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
  //
  // hotlistSet(props) {
  //   if (props.data && props.data.projectMembership) {
  //     const labels = props.data.projectMembership.labels || [];
  //     return new Immutable.Set(labels);
  //   }
  //   return Immutable.Set.of();
  // }

  public render() {
    // if (this.props.data.error) {
    //   return <ErrorDisplay error={this.props.data.error} />;
    // }
    // const { issues } = this.props.data;
    // const columns = (this.props.data && this.props.data.projectMembership &&
    //     this.props.data.projectMembership.columns) || this.defaultColumns;
    // return (<section className="kdt issue-list">
    //   <FilterParams {...this.props} query={this.query.get('search')} />
    //   <MassEdit {...this.props} issues={issues} />
    //   <IssueList
    //       {...this.props}
    //       issues={issues}
    //       labels={this.hotlist}
    //       columns={columns}
    //       loading={this.props.data.loading} />
    // </section>);
    return (
      <section className="kdt issue-list">
        Issue List
      </section>
    );
  }
}

// IssueSummaryView.propTypes = {
//   data: PropTypes.shape({
//     error: PropTypes.shape({}),
//     loading: PropTypes.bool,
//     issues: PropTypes.arrayOf(PropTypes.shape({})),
//     projectMembership: PropTypes.shape({
//       columns: PropTypes.arrayOf(PropTypes.string.isRequired),
//     }),
//   }).isRequired,
//   project: PropTypes.shape({
//     id: PropTypes.string.isRequired,
//     template: PropTypes.shape({
//       types: PropTypes.arrayOf(PropTypes.shape({})),
//     }),
//   }).isRequired,
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
//   client: PropTypes.instanceOf(ApolloClient).isRequired,
//   setFilterTerms: PropTypes.func.isRequired,
// };
//
// IssueSummaryView.contextTypes = {
//   profile: PropTypes.shape({}),
// };
//
// function defaultStates(project) {
//   // Default behavior is to show 'open' states.
//   return project.workflow.states.filter(st => !st.closed).map(st => st.id);
// }
//
// export default compose(
//   graphql(IssueListQuery, {
//     options: ({ project, location: { query } }) => {
//       const {
//         type, state,
//         summary, summaryPred,
//         description, descriptionPred,
//         label, search,
//         owner, reporter,
//         sort, subtasks,
//       } = query || {};
//       // Handle custom search
//       const custom = [];
//       for (const key of Object.keys(query)) {
//         if (key.startsWith('custom.')) {
//           const customFieldName = key.slice(7);
//           const customField = project.template.customFieldsById.get(customFieldName);
//           if (customField) {
//             if (customField.type === 'ENUM') {
//               custom.push({
//                 name: customFieldName,
//                 values: query[key].split(','),
//               });
//             } else if (customField.type === 'TEXT') {
//               custom.push({
//                 name: customFieldName,
//                 value: query[key],
//               });
//             }
//           }
//         }
//       }
//       return {
//         variables: {
//           project: project.id,
//           search,
//           type: type && type.split(','),
//           state: (state && state !== 'open') ? state.split(',') : defaultStates(project),
//           summary,
//           summaryPred,
//           description,
//           descriptionPred,
//           reporter,
//           owner,
//           cc: undefined,
//           labels: label && label.split(','),
//           comment: undefined,
//           commentPred: undefined,
//           custom,
//           sort: [sort || '-updated'],
//           subtasks: subtasks !== undefined,
//         },
//       };
//     },
//   }),
//   connect(
//     (state) => ({
//       selection: state.issueSelection,
//     }),
//     dispatch => bindActionCreators({ setFilterTerms }, dispatch),
//   ),
//   withApollo,
// )(IssueSummaryView);

export default IssueSummaryView;
