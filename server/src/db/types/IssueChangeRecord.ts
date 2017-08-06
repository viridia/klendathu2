export interface ScalarFieldChange {
  before?: string;
  after?: string;
}

export interface ListFieldChange {
  added?: string[];
  removed?: string[];
}

export interface IntListFieldChange {
  added?: number[];
  removed?: number[];
}

export interface LinkFieldChange {
  to: number;       // Issue id
  before?: string;  // Relation
  after?: string;   // Relation
}

interface CustomFieldChange {
  name: string;
  before?: string;
  after?: string;
}

export interface IssueChangeRecord {
  project: string;
  issue: number;
  by: string;
  at: Date;
  type?: ScalarFieldChange;
  state?: ScalarFieldChange;
  summary?: ScalarFieldChange;
  description?: ScalarFieldChange;
  owner?: ScalarFieldChange;
  cc?: ListFieldChange;
  labels?: IntListFieldChange;
  attachments?: {
    added?: string[];
    removed?: string[];
  };
  custom?: CustomFieldChange[];
  linked?: LinkFieldChange[];
}
