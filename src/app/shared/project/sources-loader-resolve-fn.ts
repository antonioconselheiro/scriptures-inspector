import { ActivatedRouteSnapshot } from '@angular/router';
import { Book } from '@domain/book-model';
import { getProjectFn } from './get-project-fn';
import { getProjectSourcesFn } from './get-project-sources-fn';
import { loadSourceBookFn } from './load-source-book-fn';

export function sourcesLoaderResolveFn(): (route: ActivatedRouteSnapshot) => Promise<Record<string, Book>> {
  return async (route: ActivatedRouteSnapshot) => {
    const book = route.paramMap.get('book');
    const project = getProjectFn();
    const sourcesCodex: Record<string, Book> = {};

    if (project && book) {
      const sources = getProjectSourcesFn(project);
      await Promise.all(
        [...sources, ...project.translationViewer]
          .map(source => loadSourceBookFn(project, source, book)
          .then(sourceBook => {
            if (sourceBook) {
              sourcesCodex[source] = sourceBook
            }
          }))
      );
    }

    return Promise.resolve(sourcesCodex);
  };
}
