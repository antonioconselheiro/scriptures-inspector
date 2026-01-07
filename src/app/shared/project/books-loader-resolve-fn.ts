import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { getProjectFn } from './get-project-fn';
import { getProjectSourcesFn } from './get-project-sources-fn';

export function booksLoaderResolveFn() {
  return (route: ActivatedRouteSnapshot) => {
    const http = inject(HttpClient);
    const book = route.paramMap.get('book');
    const project = getProjectFn();

    if (project) {
      const sources = getProjectSourcesFn(project);
    }

    return http.get(`/library/${langMap[lang]}/${book}.json`);
  };
}
