import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Codex } from '@domain/codex-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { getProjectFn } from './get-project-fn';
import { getProjectSourcesFn } from './get-project-sources-fn';
import { loadCodexMetadataFn } from './load-codex-metadata-fn';

export function codexLoaderResolveFn(): () => Promise<Record<string, Codex<LanguageUnionType>>> {
  return async () => {
    const httpClient = inject(HttpClient);
    const project = getProjectFn();
    const codexRecord: Record<string, Codex<LanguageUnionType>> = {};

    if (project) {
      const sources = getProjectSourcesFn(project);

      await sources.map(source => loadCodexMetadataFn(httpClient, project, source).then(data => {
        if (data) {
          codexRecord[source] = data;
        }
      }));
    }

    return codexRecord;
  }
}
