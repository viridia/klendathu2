import { User } from 'common/api';
import * as PropTypes from 'prop-types';
import * as React from 'react';
import { compose, DefaultChildProps, graphql } from 'react-apollo';
import { DragDropContext } from 'react-dnd';
import * as HTML5Backend from 'react-dnd-html5-backend';
import ReduxToastr from 'react-redux-toastr';
import 'react-redux-toastr/src/styles/index.scss';
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

import * as ProfileQuery from '../../graphql/queries/profile.graphql';

interface RouteParams {
  project: string;
}

interface Data {
  profile: User;
}

class MainPage extends React.Component<
    DefaultChildProps<RouteComponentProps<RouteParams>, Data>,
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
      nextProps: DefaultChildProps<RouteComponentProps<RouteParams>, Data>) {
    this.checkAuth(nextProps);
  }

  public render(): any {
    const { location, history, data: { error } } = this.props;
    if (error) {
      return <ErrorDisplay error={error} />;
    }
    return (
      <div className="kdt page">
        <ReduxToastr
            position="bottom-left"
            timeOut={7000}
            transitionIn="fadeIn"
            transitionOut="fadeOut"
        />
        <Header location={location} history={history} />
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
    if (!profile && !loading && !error) {
      history.replace({ pathname: '/login', state: { next: location } });
    } else if (profile && !profile.username) {
      this.props.history.replace({ pathname: '/finishSignup', state: { next: location } });
    }
  }
}

export default compose(
  graphql(ProfileQuery),
  withRouter,
  DragDropContext(HTML5Backend),
)(MainPage);
