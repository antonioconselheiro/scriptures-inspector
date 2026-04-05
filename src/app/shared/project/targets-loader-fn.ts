import { ProjectData } from '@domain/project-data-model';
import { getProjectFn } from './get-project-fn';
import { getProjectTargetsFn } from './get-project-targets-fn';
import { isKeyInterlinearFn } from './is-key-interlinear-fn';
import { isKeyMetadataFn } from './is-key-metadata-fn';
import { isKeyTranslationFn } from './is-key-translation-fn';
import { loadTargetInterlinearBookFn } from './load-target-interlinear-book-fn';
import { loadTargetMetadataBookFn } from './load-target-metadata-book-fn';
import { loadTargetTranslationBookFn } from './load-target-translation-book-fn';

export async function targetsLoaderFn(book: string | null): Promise<ProjectData> {
  const project = getProjectFn();
  const targetsCodex: ProjectData = {};

  if (project && book) {
    const targets = getProjectTargetsFn(project);
    await Promise.all(
      targets
        .map(target => {
          if (isKeyMetadataFn(target)) {
            return loadTargetMetadataBookFn(project, target, book)
              .then(savedBook => targetsCodex[target] = savedBook);
          } else if (isKeyInterlinearFn(target)) {
            return loadTargetInterlinearBookFn(project, target, book)
              .then(savedBook => targetsCodex[target] = savedBook);
          } else if (isKeyTranslationFn(target)) {
            return loadTargetTranslationBookFn(project, target, book)
              .then(savedBook => targetsCodex[target] = savedBook);
          } else {
            return Promise.resolve();
          }
        })
    );
  }

  return Promise.resolve(targetsCodex);
}
