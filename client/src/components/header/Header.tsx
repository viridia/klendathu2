// import ProjectQuery from '../../graphql/queries/project.graphql';
import { Location } from 'history';
import * as React from 'react';
// import { graphql } from 'react-apollo';
import { Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
// import { ProjectContent } from '../../store/fragments';
import { Role } from '../../../../common/api/Role';
import './Header.scss';
import SignInLink from './SignInLink';
import UserMenuButton from './UserMenuButton';

const AddBoxIcon = require('icons/ic_add_box_black_24px.svg');

interface Props {
  data?: {
    project?: {
      name: string;
      role: number;
    };
  };
  location: Location;
}

function Header(props: Props) {
  const { data: { project } = { project: null } } = props;
  return (
    <header className="kdt header">
      <span className="title">Klendathu</span>
      <span className="subtitle">
        <span> - </span>
        &ldquo;in order to <em>fight</em> the bug, we must <em>understand</em> the bug.&rdquo;
      </span>
      {project && project.role >= Role.REPORTER && (
        <LinkContainer
          to={{
            pathname: `/project/${project.name}/new`,
            state: { back: props.location },
          }}
        >
          <Button bsStyle="primary"><AddBoxIcon />New Issue...</Button>
        </LinkContainer>
      )}
      <SignInLink {...props} />
      <UserMenuButton {...props} />
    </header>
  );
}

// Header.propTypes = {
//   data: PropTypes.shape({
//     project: PropTypes.shape({
//       name: PropTypes.string.isRequired,
//       role: PropTypes.number.isRequired,
//     }),
//   }),
//   location: PropTypes.shape({
//     pathname: PropTypes.string.isRequired,
//   }).isRequired,
// };

// export default graphql(ProjectQuery, { // eslint-disable-line
//   options: ({ params }) => ({
//     variables: { project: params.project },
//     fragments: [ProjectContent],
//   }),
//   skip: ({ params }) => !params.project,
// })(Header);

export default Header;
