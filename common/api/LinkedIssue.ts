import { Relation } from './Relation';

/** Defines a relationship between one issue and another. */
export interface LinkedIssue {
  /** ID of issue to which this is linked. */
  to: number;

  /** Type of the relation. */
  relation: Relation;
}
