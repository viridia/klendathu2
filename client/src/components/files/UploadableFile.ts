import Axios from 'axios';
import { Attachment } from 'common/api';

/** Data object representing a file to upload. This mainly exists so that we can keep the
    browser File object and it's associated progress callback together in once place. */
export default class UploadableFile implements Attachment {
  public id: string;
  public url: string;
  public thumbnail?: string;
  private file: File;
  private progress: number;

  constructor(file: File) {
    this.file = file;
    this.progress = 0;
    this.id = null;
    this.url = null;
  }

  public get filename() {
    return this.file.name;
  }

  public get type() {
    return this.file.type;
  }

  /** Begin uploading the file, returns a promise. */
  public upload(onProgress: (progressEvent: any) => void) {
    const formData = new FormData();
    formData.append('attachment', this.file);
    return Axios.post('/api/file', formData, {
      onUploadProgress: onProgress,
      headers: {
        authorization: `JWT ${localStorage.getItem('token')}`,
      },
    }).then(resp => {
      this.id = resp.data.id;
      this.url = resp.data.url;
      this.thumbnail = resp.data.thumb;
      return resp.data;
    });
  }
}
