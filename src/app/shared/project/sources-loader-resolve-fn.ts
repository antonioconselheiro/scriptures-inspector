import { ActivatedRouteSnapshot } from '@angular/router';
import { Book } from '@domain/book-model';
import { getProjectFn } from './get-project-fn';
import { getProjectSourcesFn } from './get-project-sources-fn';
import { loadSourceBookFn } from './load-source-book-fn';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export function sourcesLoaderResolveFn(): (route: ActivatedRouteSnapshot) => Promise<Record<string, Book>> {
  return async (route: ActivatedRouteSnapshot) => {
    const book = route.paramMap.get('book');
    const codex = route.data['codex'];
    const project = getProjectFn();
    const sourcesCodex: Record<string, Book> = {};
    const httpClient = inject(HttpClient);

    if (project && book) {
      const sources = getProjectSourcesFn(project);
      const translationViewer = project.translationViewer || [];

      await Promise.all(
        [...new Set([...sources, ...translationViewer])]
          .filter(source => codex[source] && codex[source].data[book])
          .map(source => loadSourceBookFn(httpClient, project, source, book)
          .then(sourceBook => {
            if (sourceBook) {
              sourcesCodex[source] = sourceBook;
            }
          }))
      );
    }

    return Promise.resolve(sourcesCodex);
  };
}
