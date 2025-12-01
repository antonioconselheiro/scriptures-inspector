import { Routes } from '@angular/router';
import { Inspector } from './pages/inspector/inspector';

export const routes: Routes = [
  {
    path: 'book/:book/chapter/:chapter',
    runGuardsAndResolvers: 'pathParamsChange',
    component: Inspector
  },

  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/book/gn/chapter/1'
  }
];
