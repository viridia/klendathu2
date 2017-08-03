import * as React from 'react';
import { DefaultChildProps, graphql } from 'react-apollo';
import LabelQuery from '../../graphql/queries/label.graphql';
import './LabelName.scss';

interface Props {
  label: number;
  project: string;
}

interface Data {
  label: any;
}

/** Component that displays a label as a chip. */
class LabelName extends React.Component<DefaultChildProps<Props, Data>, undefined> {
  public render() {
    const label = this.props.data.label;
    if (label) {
      return (
        <span className="label-name" style={{ backgroundColor: label.color }}>
          {label.name}
        </span>
      );
    } else {
      return <span className="label-name">unknown label</span>;
    }
  }
}

export default graphql(LabelQuery, {
  options: ({ label, project }: Props) => ({ variables: { label, project } }),
})(LabelName);
