import { Label, ProjectMembership } from '../../../common/api';

/** Root resolver class. */
export class Root {
  public projectMembership({ project, user }: { project?: string, user?: string }):
      ProjectMembership | null {
    return null;
  }

  public projectMemberships({ project }: { project?: string }): ProjectMembership[] {
    return null;
  }

  public label({ project, id }: { project: string, id: number }): Label | null {
    return null;
  }

  public labels({ project, token }: { project: string, token?: string }): Label[] {
    return null;
  }
}
