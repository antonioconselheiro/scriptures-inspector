import { HttpClient } from '@angular/common/http';
import { Project } from '@domain/project-model';
import { SourceBook } from '@domain/source-book-model';
import { firstValueFrom } from 'rxjs';
import { getSourcePathFn } from './get-source-path-fn';
import { readJsonFileFn } from './read-file-json-fn';

export async function loadSourceBookFn(httpClient: HttpClient, project: Project, source: string, book: string): Promise<SourceBook | null> {
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
