import { Routes } from '@angular/router';
import { Inspector } from './pages/inspector/inspector';
import { booksLoaderResolveFn } from './shared/project/books-loader-resolve-fn';

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
