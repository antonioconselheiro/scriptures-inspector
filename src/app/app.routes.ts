import { Routes } from '@angular/router';
import { booksLoaderResolveFn } from '@shared/project/books-loader-resolve-fn';
import { repositoriesLoadResolverFn } from '@shared/project/repositories-load-resolver-fn';
import { Inspector } from './pages/inspector/inspector';

export const routes: Routes = [
  {
    path: 'book/:book/chapter/:chapter',
    runGuardsAndResolvers: 'pathParamsChange',
    resolve: {
      books: booksLoaderResolveFn(),
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
