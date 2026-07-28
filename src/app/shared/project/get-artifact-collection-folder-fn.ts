import { Project } from '@domain/project-model';

export function getArtifactCollectionFolderFn(project: Project, collectionFolder: string): string {
  return `${project.path}/artifacts/${collectionFolder}`;
}