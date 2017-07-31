interface ProjectPrefsRecord {
  user: string;
  project: string;
  columns?: string[];
  labels?: number[];
  filters?: Array<{ name: string, value: string; }>;
}

export default ProjectPrefsRecord;
