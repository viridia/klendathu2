import { Project } from 'common/api';
import DeleteProjectMutation from '../../graphql/mutations/deleteProject.graphql';
import NewProjectMutation from '../../graphql/mutations/newProject.graphql';
import UpdateProjectMutation from '../../graphql/mutations/updateProject.graphql';
import ProjectListQuery from '../../graphql/queries/projectList.graphql';
import apollo from '../apollo';

export function createProject(input: Partial<Project>) {
  return apollo.mutate<{ newProject: Project }>({
    mutation: NewProjectMutation,
    variables: { input },
    update: (store, { data: { newProject } }) => {
      const data: { projects: Project[] } = store.readQuery({ query: ProjectListQuery });
      data.projects.push(newProject);
      store.writeQuery({ query: ProjectListQuery, data });
    },
  });
}

export function deleteProject(project: string) {
  return apollo.mutate<{ deleteProject: string }>({
    mutation: DeleteProjectMutation,
    variables: { project },
    update: (store, { data: { deleteProject: deletedId } }) => {
      const data: { projects: Project[] } = store.readQuery({ query: ProjectListQuery });
      data.projects = data.projects.filter(p => p.id !== deletedId);
      store.writeQuery({ query: ProjectListQuery, data });
    },
  });
}

export function updateProject(project: string, input: Partial<Project>) {
  return apollo.mutate({
    mutation: UpdateProjectMutation,
    variables: { input, project },
    // fragments: ProjectContent,
  });
}
