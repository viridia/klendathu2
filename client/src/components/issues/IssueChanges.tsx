import { Change, Comment, CustomFieldChange, Issue, LinkChange, Project } from 'common/api';
import * as marked from 'marked';
import * as React from 'react';
import { caption } from '../../lib/relation';
import IssueSummary from '../common/IssueSummary';
import LabelName from '../common/LabelName';
import RelativeDate from '../common/RelativeDate';
import UserName from '../common/UserName';
import './IssueChanges.scss';

function compareEntries(a: [Date, JSX.Element], b: [Date, JSX.Element]) {
  if (a[0] < b[0]) { return -1; }
  if (a[0] > b[0]) { return 1; }
  return 0;
}

function renderBody(body: string) {
  return <div className="comment-body" dangerouslySetInnerHTML={{ __html: marked(body) }} />;
}

function Comment({ comment }: { comment: Comment }) {
  return (
    <section className="comment">
      <header className="comment-header">
        <UserName user={comment.author} fullOnly={true} />
        &nbsp;commented&nbsp;
        <RelativeDate date={new Date(comment.created)} />
        :
      </header>
      {renderBody(comment.body)}
    </section>
  );
}

function Change({ change, project }: { change: Change, project: Project }) {
  function linkChange({ to, before, after }: LinkChange) {
    if (before && after) {
      return (
        <li className="field-change linked-issue" key={to}>
          changed <span className="relation">{caption[before]}</span>
          &nbsp;%raquo;&nbsp;
          <span className="relation">{caption[after]}</span>
          <IssueSummary id={to} project={project.id} key={to} />
        </li>
      );
    } else if (before) {
      return (
        <li className="field-change linked-issue" key={to}>
          removed <span className="relation">{caption[before]}</span>
          <IssueSummary id={to} project={project.id} key={to} />
        </li>
      );
    } else {
      return (
        <li className="field-change linked-issue" key={to}>
          added <span className="relation">{caption[after]}</span>
          <IssueSummary id={to} project={project.id} key={to} />
        </li>
      );
    }
  }

  function customValue(value: string) {
    return value !== null
      ? <span className="custom-value">{value || '""'}</span>
      : <span className="custom-value-none">(none)</span>;
  }

  function customChange({ name, before, after }: CustomFieldChange) {
    return (
      <li className="field-change custom-field" key={name}>
        changed <span className="field-name">
          {name}
        </span> from {customValue(before)} to {customValue(after)}
      </li>);
  }

  return (
    <section className="change">
      <header className="change-header">
        <UserName user={change.by} fullOnly={true} />
        &nbsp;made changes&nbsp;
        <RelativeDate date={new Date(change.at)} />
        :
      </header>
      <ul className="field-change-list">
        {change.type && (
          <li className="field-change">
            type: <span className="type">
              {change.type.before}
            </span> to <span className="type">
              {change.type.after}
            </span>
          </li>)}
        {change.state && (
          <li className="field-change">
            state: <span className="state">
              {change.state.before}
            </span> to <span className="state">
              {change.state.after}
            </span>
          </li>)}
        {change.summary && (<li className="field-change">
          changed <span className="field-name">summary</span> from &quot;
          {change.summary.before}&quot; to &quot;
          {change.summary.after}&quot;
        </li>)}
        {change.description && (<li className="field-change">
          changed <span className="field-name">description</span>.
        </li>)}
        {change.owner &&
          <li className="field-change">owner: {change.owner.before} to {change.owner.after}</li>}
        {change.cc && change.cc.added && change.cc.added.map(cc => (
          <li className="field-change" key={cc}>
            added <UserName user={cc} full={true} /> to cc</li>))}
        {change.cc && change.cc.removed && change.cc.removed.map(cc => (
          <li className="field-change" key={cc}>
            removed <UserName user={cc} full={true} /> from cc</li>))}
        {change.labels && change.labels.added && change.labels.added.map(l =>
          (<li className="field-change" key={l}>
            added label <LabelName label={l} project={project.id} key={l} />
          </li>))}
        {change.labels && change.labels.removed && change.labels.removed.map(l =>
          (<li className="field-change" key={l}>
            removed label <LabelName label={l} project={project.id} key={l} />
          </li>))}
        {change.attachments && change.attachments.addedData && change.attachments.addedData.map(a =>
          (<li className="field-change" key={a.id}>
            attached file <span className="attachment">{a.filename}</span>
          </li>))}
        {change.attachments && change.attachments.removedData &&
            change.attachments.removedData.map(a =>
          (<li className="field-change" key={a.id}>
            removed file <span className="attachment">{a.filename}</span>
          </li>))}
        {change.linked && change.linked.map(linkChange)}
        {change.custom && change.custom.map(customChange)}
      </ul>
    </section>
  );
}

interface Props {
  issue: Issue;
  comments: Comment[];
  changes: Change[];
  project: Project;
}

export default class IssueChanges extends React.Component<Props> {
  public render() {
    return (
      <section className="changes-list">
        {this.sortEntriesByDate().map(entry => entry[1])}
      </section>
    );
  }

  private sortEntriesByDate() {
    const { comments, changes, project } = this.props;
    const result: Array<[Date, JSX.Element]> = [];
    if (comments) {
      comments.forEach(c => {
        result.push([new Date(c.created), <Comment comment={c} key={result.length} />]);
      });
    }
    if (changes) {
      changes.forEach(c => {
        result.push([new Date(c.at), <Change change={c} key={result.length} project={project} />]);
      });
    }
    result.sort(compareEntries);
    return result;
  }
}
