interface MembershipRecord {
  user: string;
  project?: string;
  organization?: string;
  role: number;
  created: Date;
  updated: Date;
}

export default MembershipRecord;
