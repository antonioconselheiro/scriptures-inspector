import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Project } from '@domain/project-model';
import { SourceBook } from '@domain/source-book-model';
import { firstValueFrom } from 'rxjs';
import { readJsonFileFn } from './read-file-json-fn';
import { getSourcePathFn } from './get-source-path-fn';

export async function loadSourceBookFn(project: Project, source: string, book: string): Promise<SourceBook | null> {
  const httpClient = inject(HttpClient);
  const resourcePath = getSourcePathFn(project, source, `${book}.json`);

  // TODO: incluir validação de schema para json do projeto
  if (/^http/.test(resourcePath)) {
    return firstValueFrom(httpClient.get<SourceBook>(resourcePath)).catch(e => {
      console.error(e);
      return null;
    });
  } else {
    return readJsonFileFn<SourceBook>(resourcePath);
  }
}
