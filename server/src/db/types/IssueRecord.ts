// Database representation of a comment
export interface CommentEntry {
  author?: string;
  body: string;
  created: Date;
  updated: Date;
}

// Database representation of custom field values
export interface CustomValues {
  [name: string]: string | number | boolean;
}

// // Database representation of a link to another issue
// // Element 0 is the issue id, element 1 is the relation type.
// export type Link = [number, string];
//
// // Constructor for links
// export function Link(to: number, relation: string): Link { // tslint:disable-line:function-name
//   return [to, relation];
// }

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
  // linked: Link[];
  custom: CustomValues;
  comments: CommentEntry[];
  attachments: string[];
  isPublic?: boolean;
  // changes?: ChangeEntry[];
}
