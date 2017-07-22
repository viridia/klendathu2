import { Project } from 'common/api';
import apollo from '../apollo';
// import { ProjectContent } from './fragments';

const NewProjectMutation = require('../../graphql/mutations/newProject.graphql');
const UpdateProjectMutation = require('../../graphql/mutations/updateProject.graphql');
const DeleteProjectMutation = require('../../graphql/mutations/deleteProject.graphql');
const ProjectListQuery = require('../../graphql/queries/projectList.graphql');

export function createProject(project: Partial<Project>) {
  return apollo.mutate<{ newProject: Project }>({
    mutation: NewProjectMutation,
    variables: { project },
    update: (store, { data: { newProject } }) => {
      const data: { projects: Project[] } = store.readQuery({ query: ProjectListQuery });
      data.projects.push(newProject);
      store.writeQuery({ query: ProjectListQuery, data });
    },
  });
}

export function deleteProject(id: string) {
  return apollo.mutate<{ deleteProject: string }>({
    mutation: DeleteProjectMutation,
    variables: { id },
    update: (store, { data: { deleteProject: deletedId } }) => {
      const data: { projects: Project[] } = store.readQuery({ query: ProjectListQuery });
      data.projects = data.projects.filter(p => p.id !== deletedId);
      store.writeQuery({ query: ProjectListQuery, data });
    },
  });
}

export function updateProject(id: string, project: Partial<Project>) {
  return apollo.mutate({
    mutation: UpdateProjectMutation,
    variables: { id, project },
    // fragments: ProjectContent,
  });
}
