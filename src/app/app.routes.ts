import { Routes } from '@angular/router';
import { Inspector } from './pages/inspector/inspector';
import { scriptureLoaderResolveFn } from './shared/scripture-loader/scripture-loader-resolve-fn';

export const routes: Routes = [
  {
    path: 'book/:book/chapter/:chapter',
    runGuardsAndResolvers: 'pathParamsChange',
    resolve: {
      hebraic: scriptureLoaderResolveFn('hebraic'),
      geez: scriptureLoaderResolveFn('geez'),
      greek: scriptureLoaderResolveFn('greek')
    },
    component: Inspector
  },

  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/book/gen/chapter/1'
  }
];
