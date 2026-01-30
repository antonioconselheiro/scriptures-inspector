import { HttpClient } from '@angular/common/http';
import { Codex } from '@domain/codex-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { Project } from '@domain/project-model';
import { firstValueFrom } from 'rxjs';
import { readJsonFileFn } from './read-file-json-fn';
import { getSourcePathFn } from './get-source-path-fn';

export async function loadCodexMetadataFn(httpClient: HttpClient, project: Project, name: string): Promise<Codex<LanguageUnionType> | null> {
  const resourcePath = getSourcePathFn(project, name, `_.codex`);

  if (/^http/.test(resourcePath)) {
    return firstValueFrom(httpClient.get<Codex<LanguageUnionType>>(resourcePath)).catch(e => {
      console.error(e);
      return null;
    });
  } else {
    return readJsonFileFn<Codex<LanguageUnionType>>(resourcePath);
  }
}
