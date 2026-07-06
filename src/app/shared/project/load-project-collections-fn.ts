import { FragmentCollection } from '@domain/fragment-collection-model';
import { Project } from '@domain/project-model';
import { listDirectoriesFn } from './list-directories-fn';
import { readJsonFileFn } from './read-file-json-fn';

export async function loadProjectCollectionsFn(project: Project): Promise<Array<FragmentCollection>> {
  const collections: Array<FragmentCollection> = [];
  const promises: Array<Promise<void>> = [];
  const directories = await listDirectoriesFn(`${project.path}/fragments`);

  directories.forEach(directory => {
    const promise = readJsonFileFn<FragmentCollection>(`${project.path}/fragments/${directory}/metadata.json`)
      .then(metadata => {
        if (metadata) {
          metadata.folder = directory;
          collections.push(metadata);
        }
      });
    promises.push(promise);
  });

  await Promise.all(promises);
  return collections;
}