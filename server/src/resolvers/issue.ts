// import { Issue } from '../../../common/api';
import Context from '../context/Context';

// Queries involving issues
export const queries = {
  issue(_: any, args: { project: string, id: number }, context: Context): any {
    //
  },

  issues(_: any, args: { project: string, search?: string }, context: Context): any {
    //
  },
};
