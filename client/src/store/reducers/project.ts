import { Project } from 'common/api';
import * as ProjectListQuery from '../../graphql/queries/projectList.graphql';
import apollo from '../apollo';

const DeleteProjectMutation = require('../../graphql/mutations/deleteProject.graphql');
const NewProjectMutation = require('../../graphql/mutations/newProject.graphql');
const UpdateProjectMutation = require('../../graphql/mutations/updateProject.graphql');

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
