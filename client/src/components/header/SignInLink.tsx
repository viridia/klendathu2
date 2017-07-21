import { Location } from 'history';
import * as PropTypes from 'prop-types';
import * as React from 'react';
import { Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

interface Props {
  location: Location;
}

interface Context {
  profile?: any;
}

export default function SignInLink(props: Props, context: Context) {
  if (!context.profile) {
    return (
      <LinkContainer
        className="header-link"
        to={{ pathname: '/login', state: { next: props.location } }}
      >
        <Button bsStyle="link">Sign In</Button>
      </LinkContainer>
    );
  }
  return null;
}

(SignInLink as any).contextTypes = {
  profile: PropTypes.shape({}),
};
