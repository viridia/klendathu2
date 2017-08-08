// Database representation of a comment
export interface CommentEntry {
  id: number;
  author?: string;
  body: string;
  created: Date;
  updated: Date;
}

// Database representation of custom field values
export interface CustomValues {
  [name: string]: string | number | boolean;
}

// Composite key for an issue
export type IssueId = [string, number]; // [project, index]

// Constructor for issue ids
export function IssueId(project: string, id: number): IssueId { // tslint:disable-line:function-name
  return [project, id];
}

// Database representation of an issue
export interface IssueRecord {
  id: IssueId; // [project, index]
  type: string;
  state: string;
  summary: string;
  description: string;
  reporter: string;
  owner: string;
  cc: string[];
  created: Date;
  updated: Date;
  labels: number[];
  custom: CustomValues;
  comments: CommentEntry[];
  attachments: string[];
  isPublic?: boolean;
}
