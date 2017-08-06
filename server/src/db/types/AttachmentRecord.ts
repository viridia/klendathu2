/** Information about a file attachment to an issue. */
export interface AttachmentRecord {
  id: string;
  filename: string;
  url: string;
  thumbnail?: string;
  type: string;
}
