import autobind from 'bind-decorator';
import { Project, Relation } from 'common/api';
import * as Immutable from 'immutable';
import * as React from 'react';
import { Button } from 'react-bootstrap';
import { caption } from '../../lib/relation';
import IssueSummary from '../common/IssueSummary';
import './IssueLinks.scss';

const CloseIcon = require('icons/ic_close_black_24px.svg');

interface Props {
  project: Project;
  links: Immutable.Iterable<number, Relation>;
  onRemoveLink: (to: number) => void;
}

export default class IssueLinks extends React.Component<Props> {
  public render() {
    const { links } = this.props;
    if (!links || links.size === 0) {
      return null;
    }
    return <ul className="issue-links">{links.map(this.renderLink)}</ul>;
  }

  @autobind
  private renderLink(relation: Relation, to: number) {
    return (
      <li className="issue-link" key={to}>
        <span className="relation">{caption[relation]}</span>
        <IssueSummary id={to} project={this.props.project.id} />
        {this.props.onRemoveLink && (
          <Button className="bare light" onClick={() => this.props.onRemoveLink(to)}>
            <CloseIcon />
          </Button>)}
      </li>
    );
  }
}
