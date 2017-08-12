import { User } from 'common/api';
import * as React from 'react';
import { DefaultChildProps, graphql } from 'react-apollo';

import * as UserQuery from '../../graphql/queries/user.graphql';

interface Props {
  user?: string;
  full?: boolean;
  fullOnly?: boolean;
}

interface Data {
  user: User;
}

class UserName extends React.Component<DefaultChildProps<Props, Data>> {
  public render() {
    const userInfo = this.props.data.user;
    if (userInfo) {
      if (this.props.fullOnly && userInfo.fullname) {
        return (
          <span className="user-name" title={userInfo.username}>
            <span className="full">{userInfo.fullname}</span>
          </span>
        );
      } else if (this.props.full && userInfo.fullname) {
        return (
          <span className="user-name">
            <span className="full">{userInfo.fullname}</span>
            &nbsp;({userInfo.username})
          </span>
        );
      } else {
        return <span className="user-name">{userInfo.username}</span>;
      }
    } else {
      return <span className="user-name" />;
    }
  }
}

export default graphql(UserQuery, {
  options: ({ user }: Props) => ({ variables: { user } }),
})(UserName);
