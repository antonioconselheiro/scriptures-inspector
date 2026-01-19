import { Routes } from '@angular/router';
import { repositoriesLoadResolverFn } from '@shared/project/repositories-load-resolver-fn';
import { sourcesLoaderResolveFn } from '@shared/project/sources-loader-resolve-fn';
import { targetsLoaderResolveFn } from '@shared/project/targets-loader-resolve-fn';
import { EditorComponent } from './pages/inspector/editor/editor-component';
import { ProjectsComponent } from './pages/projects/projects-component';

export const routes: Routes = [
  {
    path: 'projects',
    component: ProjectsComponent
  },

  {
    path: 'book/:book/chapter/:chapter',
    runGuardsAndResolvers: 'pathParamsChange',
    resolve: {
      sources: sourcesLoaderResolveFn(),
      targets: targetsLoaderResolveFn(),
      repositories: repositoriesLoadResolverFn()
    },
    component: EditorComponent
  },

  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/projects'
  }
];
