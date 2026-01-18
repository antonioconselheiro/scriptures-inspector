import { Routes } from '@angular/router';
import { sourcesLoaderResolveFn as sourcesLoaderResolveFn } from '@shared/project/sources-loader-resolve-fn';
import { repositoriesLoadResolverFn } from '@shared/project/repositories-load-resolver-fn';
import { Inspector } from './pages/inspector/inspector';

export const routes: Routes = [
  {
    path: 'book/:book/chapter/:chapter',
    runGuardsAndResolvers: 'pathParamsChange',
    resolve: {
      sources: sourcesLoaderResolveFn(),
      targets: targetsLoaderResolverFn(),
      repositories: repositoriesLoadResolverFn()
    },
    component: Inspector
  },

  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/book/gen/chapter/1'
  }
];
