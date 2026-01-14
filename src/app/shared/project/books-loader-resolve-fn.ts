import { ActivatedRouteSnapshot } from '@angular/router';
import { Book } from '@domain/book-model';
import { getBookFn } from './get-book-fn';
import { getProjectFn } from './get-project-fn';
import { getProjectSourcesFn } from './get-project-sources-fn';
import { getProjectViewingTranslationFn } from './get-project-viewing-translations-fn';

export function booksLoaderResolveFn(): (route: ActivatedRouteSnapshot) => Promise<Record<string, Book>> {
  return async (route: ActivatedRouteSnapshot) => {
    const book = route.paramMap.get('book');
    const project = getProjectFn();
    const crossSourcesCodex: Record<string, Book> = {};

    if (project && book) {
      const sources = getProjectSourcesFn(project);
      const translations = getProjectViewingTranslationFn(project);
      await Promise.all([...sources, ...translations]
        .map(source => getBookFn(source, book)
        .then(sourceBook => crossSourcesCodex[source] = sourceBook))
      );
    }

    return Promise.resolve(crossSourcesCodex);
  };
}
