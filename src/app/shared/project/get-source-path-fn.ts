import { Project } from '@domain/project-model';

export function getSourcePathFn(project: Project, sourceName: string, fileName: string): string {
    let resourcePath = '';

  if (/^@/.test(sourceName) && project.repositories) {
    const repositoryKey = Object.keys(project.repositories).find(path => path === sourceName.replace(/^@|\/[^ ]+$/g, '')) || '';
    const folderName = sourceName.replace(/^@[^ ]+\//, '');

    if (repositoryKey) {
      const repository = project.repositories[repositoryKey].replace(/repository.json$/, '');
      resourcePath = `${repository}/${folderName}/${fileName}`;

      if (!/^http/.test(resourcePath)) {
        resourcePath = `${project.path}/${resourcePath}`;
      }
    }
  } else {
    resourcePath = `${project.path}/sources/${sourceName}/${fileName}`;
  }

  return resourcePath;
}