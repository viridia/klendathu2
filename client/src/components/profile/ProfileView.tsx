import autobind from 'bind-decorator';
import * as PropTypes from 'prop-types';
import * as React from 'react';
import { Tab, Tabs } from 'react-bootstrap';

interface State {
  selected: number;
}

export default class ProfileView extends React.Component<undefined, State> {
  public static contextTypes = {
    profile: PropTypes.shape({
      fullname: PropTypes.string,
      // username: React.PropTypes.string,
    }),
  };

  constructor() {
    super();
    this.state = { selected: 1 };
  }

  public render() {
    const { profile } = this.context;
    if (!profile) {
      return <section className="kdt project-settings" />;
    }
    return (
      <section className="kdt project-settings">
      <header>Profile</header>
      <Tabs
          activeKey={this.state.selected}
          onSelect={this.onHandleSelect}
          id="project-panel"
          animation={false}
      >
        <Tab eventKey={1} title="Account">
          <div className="settings-tab-pane">
            Full Name: {profile.fullname}
          </div>
        </Tab>
        <Tab eventKey={2} title="Organizations">
          <div className="settings-tab-pane">
            Organizations.
          </div>
        </Tab>
      </Tabs>
    </section>);
  }

  @autobind
  private onHandleSelect(selected: any) {
    console.debug(selected);
    this.setState({ selected });
  }
}
