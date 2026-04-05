import { ActivatedRouteSnapshot } from '@angular/router';
import { ProjectData } from '@domain/project-data-model';
import { targetsLoaderFn } from './targets-loader-fn';

export function targetsLoaderResolveFn(): (route: ActivatedRouteSnapshot) => Promise<ProjectData> {
  return async (route: ActivatedRouteSnapshot) => {
    const book = route.paramMap.get('book');
    return targetsLoaderFn(book);
  };
}
