export interface LabelRecord {
  id: [string, number]; // [project, index]
  name: string;
  color: string;
  creator: string;
  created: Date;
  updated: Date;
}
