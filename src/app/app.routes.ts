import { Routes } from '@angular/router';
import { Inspector } from './pages/inspector/inspector';
import { translationResolver } from './translation.fn-resolver';
import { TimesInspector } from './pages/times-inspector/times-inspector';
import { ExportableDocument } from './pages/exportable-document/exportable-document';

export const routes: Routes = [
  {
    path: 'book/:book/chapter/:chapter',
    runGuardsAndResolvers: 'pathParamsChange',
    children: [
      {
        path: 'language/:language/translation/:translation',
        resolve: {
          translation: translationResolver
        },
        component: Inspector
      }
    ]
  },

  {
    path: 'document',
    component: ExportableDocument
  },

  {
    path: 'times',
    component: TimesInspector
  },

  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/book/gn/chapter/1/language/pt/translation/acf'
  }
];
