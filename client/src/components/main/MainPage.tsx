// TODO: add toasts
// import ReduxToastr from 'react-redux-toastr';
// import 'react-redux-toastr/src/less/index.less';
import { User } from 'common/api';
import * as PropTypes from 'prop-types';
import * as React from 'react';
import { compose, DefaultChildProps, graphql } from 'react-apollo';
import {
  Route,
  RouteComponentProps,
  Switch,
  withRouter,
} from 'react-router-dom';
import NotFound from '../common/NotFound';
import DashboardView from '../dashboard/DashboardView';
import ErrorDisplay from '../debug/ErrorDisplay';
import GraphiQLPage from '../debug/GraphiQLPage';
import Header from '../header/Header';
import ProjectView from '../projects/ProjectView';
import './MainPage.scss';

const ProfileQuery = require('../../graphql/queries/profile.graphql');

interface Data {
  profile: User;
}

class MainPage extends React.Component<
    DefaultChildProps<RouteComponentProps<{}>, Data>,
    undefined> {
  public static childContextTypes = {
    profile: PropTypes.shape({
      id: PropTypes.string,
    }),
  };

  public getChildContext() {
    return { profile: this.props.data.profile };
  }

  public componentDidMount() {
    this.checkAuth(this.props);
  }

  public componentWillReceiveProps(
      nextProps: DefaultChildProps<RouteComponentProps<{}>, Data>) {
    this.checkAuth(nextProps);
  }

  public render(): any {
    const { location, data: { error } } = this.props;
    // const { params, data: { error, profile } } = this.props;
    if (error) {
      return <ErrorDisplay error={error} />;
    }
    // const main = React.cloneElement(child, { params, profile });
    // return (<div className="kdt page">
    //   <ReduxToastr position="bottom-left" />
    //   <Header location={location} params={params} />
    //   {main}
    // </div>);
    // const { path, params } = this.props.match;
    return (
      <div className="kdt page">
        <Header location={location} />
        <Switch>
          <Route path="/gql" component={GraphiQLPage} />
          <Route path="/project/:project" component={ProjectView} />
          <Route path="/profile" />
          <Route path="/" exact={true} component={DashboardView} />
          <Route component={NotFound} />
        </Switch>
      </div>
    );
  }

  private checkAuth(props: DefaultChildProps<RouteComponentProps<{}>, Data>) {
    const { location, history, data: { loading, error, profile } } = props;
    // console.log('checkAuth:', loading, error, profile);
    if (!profile && !loading && !error) {
      history.replace({ pathname: '/login', state: { next: location } });
    } else if (profile && !profile.username) {
      // console.log(profile);
      this.props.history.replace({ pathname: '/finishSignup', state: { next: location } });
    }
  }
}

export default compose(
  graphql(ProfileQuery),
  withRouter,
)(MainPage);
