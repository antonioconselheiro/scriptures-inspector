import { Routes } from '@angular/router';
import { Inspector } from './inspector/inspector';

export const routes: Routes = [
  {
    path: '/base/:translation/book/:book/chapter/:chapter',
    component: Inspector
  }
];
