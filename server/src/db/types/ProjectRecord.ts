// See Project in common/api
export interface ProjectRecord {
  id?: string;
  name: string;
  title: string;
  description: string;
  owningOrg?: string;
  created: Date;
  updated: Date;
  role?: number;
  template?: string;
  workflow?: string;
  isPublic?: boolean;
  issueIdCounter: number;
  labelIdCounter: number;
  deleted?: boolean;
}
