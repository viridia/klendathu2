/** Information about a user. */
export interface User {
  /** Login name of this user. */
  username?: string;

  /** Display name of this user. */
  fullname: string;

  /** Profile photo (URL). */
  photo?: string;

  /** Whether this account has been verified. */
  verified?: boolean;
}
