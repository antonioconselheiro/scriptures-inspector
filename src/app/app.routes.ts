import { Routes } from '@angular/router';
import { Inspector } from './pages/inspector/inspector';
import { translationResolver } from './translation.fn-resolver';

export const routes: Routes = [
  {
    path: 'book/:book/chapter/:chapter',
    component: Inspector,
    children: [
      {
        path: 'language/:language/translation/:translation',
        resolve: translationResolver,
        component: Inspector
      }
    ]
  },

  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/book/gn/chapter/1/language/pt/translation/acf'
  }
];
