import { ActivatedRouteSnapshot } from '@angular/router';
import { ProjectData } from '@domain/project-data-model';
import { getProjectFn } from './get-project-fn';
import { getProjectTargets } from './get-project-targets-fn';
import { isKeyInterlinearFn } from './is-key-interlinear-fn';
import { isKeyMetadataFn } from './is-key-metadata-fn';
import { isKeyTranslationFn } from './is-key-translation-fn';
import { loadTargetBookFn } from './load-target-book-fn';
import { loadTargetMetadataBookFn } from './load-target-metadata-book-fn';
import { loadTargetInterlinearBookFn } from './load-target-interlinear-book-fn';
import { loadTargetTranslationBookFn } from './load-target-translation-book-fn';

export function targetsLoaderResolveFn(): (route: ActivatedRouteSnapshot) => Promise<ProjectData> {
  return async (route: ActivatedRouteSnapshot) => {
    const book = route.paramMap.get('book');
    const project = getProjectFn();
    const targetsCodex: ProjectData = {};

    if (project && book) {
      const targets = getProjectTargets(project);
      await Promise.all(
        targets
          .map(target => {
            if (isKeyMetadataFn(target)) {
              return loadTargetMetadataBookFn(target, book)
                .then(savedBook => targetsCodex[target] = savedBook);
            } else if (isKeyInterlinearFn(target)) {
              return loadTargetInterlinearBookFn(target, book)
                .then(savedBook => targetsCodex[target] = savedBook);
            } else if (isKeyTranslationFn(target)) {
              return loadTargetTranslationBookFn(target, book)
                .then(savedBook => targetsCodex[target] = savedBook);
            } else {
              return loadTargetBookFn(target, book)
                .then(savedBook => targetsCodex[String(target)] = savedBook);
            }
          })
      );
    }

    return Promise.resolve(targetsCodex);
  };
}
