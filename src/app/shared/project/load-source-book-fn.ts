import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Project } from '@domain/project-model';
import { SourceBook } from '@domain/source-book-model';
import { firstValueFrom } from 'rxjs';
import { readJsonFileFn } from './read-file-json-fn';

export async function loadSourceBookFn(project: Project, source: string, book: string): Promise<SourceBook | null> {
  const httpClient = inject(HttpClient);
  let resourcePath = '';

  if (/^@/.test(source)) {
    const repository = Object.keys(project.repositories).find(path => path === source.replace(/^@|\/[^ ]+$/, '')) || '';
    const folderName = source.replace(/^@[^ ]+\//, '');

    if (repository) {
      resourcePath = `${repository}/${folderName}/${book}.json`;

      if (!/^http/.test(repository)) {
        resourcePath = `${project.path}/sources/${resourcePath}`;
      }
    }
  } else {
    resourcePath = `${project.path}/sources/${source}/${book}.json`;
  }

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
