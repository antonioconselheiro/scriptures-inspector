import { ActivatedRouteSnapshot } from '@angular/router';
import { Book } from '@domain/book-model';
import { getProjectFn } from './get-project-fn';
import { getProjectTargets } from './get-project-targets-fn';
import { loadSourceBookFn } from './load-source-book-fn';

export function targetsLoaderResolveFn(): (route: ActivatedRouteSnapshot) => Promise<Record<string, Book>> {
  return async (route: ActivatedRouteSnapshot) => {
    const book = route.paramMap.get('book');
    const project = getProjectFn();
    const targetsCodex: Record<string, Book> = {};

    if (project && book) {
      const targets = getProjectTargets(project);
      await Promise.all(
        [...targets, ...project.translationViewer]
          .map(target => loadSourceBookFn(target, book)
          .then(savedBook => targetsCodex[target] = savedBook))
      );
    }

    return Promise.resolve(targetsCodex);
  };
}
