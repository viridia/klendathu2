interface LabelRecord {
  id: string;
  project: string;
  labelId: number;
  name: string;
  color: string;
  creator: string;
  created: Date;
  updated: Date;
}

export default LabelRecord;
