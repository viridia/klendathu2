export interface UserRecord {
  id: string; // username
  email: string;
  fullname: string;
  password: string;
  verified: boolean;
  photo: string;
  organizations: string[];
}
