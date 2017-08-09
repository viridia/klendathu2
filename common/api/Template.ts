/** Field data type. */
export enum DataType {
  TEXT = 'TEXT',
  ENUM = 'ENUM',
}

/** Defines a custom field type. */
export interface FieldType {
  /** Unique id of this field. */
  id: string;

  /** Label for this field. */
  caption: string;

  /** Data type for this field. */
  type: DataType;

  /** Default value for this field. */
  default?: string;

  /** Whether this field should be center-aligned in the issue list column. */
  align?: string;

  /** List of valid values for this type. */
  values?: string[];

  /** For string fields, the maximum length of the field. */
  maxLength?: number;
}

/** Defines an issue type (bug, feature request, etc.). */
export interface IssueType {
  /** Unique id of this issue type. */
  id: string;

  /** Text name of this issue type. */
  caption: string;

  /** If false, means you cannot create issues of this type. */
  abstract?: boolean;

  /** Issue type that this inherits from. */
  extends?: string;

  /** Background color for this type. */
  bg?: string;

  /** List of custom field definitions for this issue type. */
  fields?: FieldType[];
}

/** Defines the set of issue types. */
export interface Template {
  /** Name of this template. */
  name: string;

  /** Project where this workflow is defined. */
  project: string;

  /** List of issue types for this template. */
  types: IssueType[];
}
