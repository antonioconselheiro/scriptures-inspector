import { Routes } from '@angular/router';
import { codexLoaderResolveFn } from '@shared/project/codex-loader-resolve-fn';
import { repositoriesLoaderResolveFn } from '@shared/project/repositories-loader-resolve-fn';
import { sourcesLoaderResolveFn } from '@shared/project/sources-loader-resolve-fn';
import { targetsLoaderResolveFn } from '@shared/project/targets-loader-resolve-fn';
import { TranslationEditorComponent } from './pages/translator/translation-editor/translation-editor-component';
import { WelcomeScreenComponent } from './pages/welcome-screen/welcome-screen-component';
import { TranscriptionEditorComponent } from './pages/transcriptor/transcription-editor/transcription-editor-component';

export const routes: Routes = [
  {
    path: 'welcome',
    component: WelcomeScreenComponent
  },

  {
    path: 'transcriptor',
    children: [
      {
        path: 'collection/:collection/artifact/:artifact',
        component: TranscriptionEditorComponent
      }
    ]
  },

  {
    path: 'translator',
    resolve: {
      repositories: repositoriesLoaderResolveFn(),
      codex: codexLoaderResolveFn()
    },
    children: [
      {
        path: 'book/:book/chapter/:chapter',
        runGuardsAndResolvers: 'pathParamsChange',
        resolve: {
          sources: sourcesLoaderResolveFn(),
          targets: targetsLoaderResolveFn()
        },
        component: TranslationEditorComponent
      },
    ]
  },

  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/welcome'
  }
];
