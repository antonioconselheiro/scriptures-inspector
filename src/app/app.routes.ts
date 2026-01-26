import { Routes } from '@angular/router';
import { codexLoaderResolveFn } from '@shared/project/codex-loader-resolve-fn';
import { repositoriesLoaderResolveFn } from '@shared/project/repositories-loader-resolve-fn';
import { sourcesLoaderResolveFn } from '@shared/project/sources-loader-resolve-fn';
import { targetsLoaderResolveFn } from '@shared/project/targets-loader-resolve-fn';
import { EditorComponent } from './pages/inspector/editor/editor-component';
import { OpenComponent } from './pages/open-component/open-component';

export const routes: Routes = [
  {
    path: 'open',
    component: OpenComponent
  },

  {
    path: 'book/:book/chapter/:chapter',
    runGuardsAndResolvers: 'pathParamsChange',
    resolve: {
      sources: sourcesLoaderResolveFn(),
      targets: targetsLoaderResolveFn(),
      repositories: repositoriesLoaderResolveFn(),
      codex: codexLoaderResolveFn()
    },
    component: EditorComponent
  },

  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/open'
  }
];
