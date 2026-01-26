import { Codex } from '@domain/codex-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { getProjectFn } from './get-project-fn';
import { getProjectSourcesFn } from './get-project-sources-fn';
import { getProjectTargetsFn } from './get-project-targets-fn';
import { loadCodexMetadataFn } from './load-codex-metadata-fn';

export function codexLoaderResolveFn(): () => Promise<Record<string, Codex<LanguageUnionType>>> {
  return async () => {
    const project = getProjectFn();
    const codexRecord: Record<string, Codex<LanguageUnionType>> = {};

    if (project) {
      const sources = getProjectSourcesFn(project);
      const targets = getProjectTargetsFn(project);

      await sources.map(source => loadCodexMetadataFn(project, 'source', source).then(data => {
        if (data) {
          codexRecord[source] = data;
        }
      }));

      await targets.map(target => loadCodexMetadataFn(project, 'target', target).then(data => {
        if (data) {
          codexRecord[target] = data;
        }
      }));
    }

    return codexRecord;
  }
}
