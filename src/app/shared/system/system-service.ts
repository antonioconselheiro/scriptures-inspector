import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Book } from '@domain/book-model';
import { Project } from '@domain/project-model';
import { open } from '@tauri-apps/api/dialog';
import { readTextFile } from '@tauri-apps/api/fs';
import { firstValueFrom, Subject } from 'rxjs';

// TODO: integrar com tauri
@Injectable({
  providedIn: 'root'
})
export class SystemService {

  static autoSaveCurrentProject = new Subject<void>();

  constructor(
    private httpClient: HttpClient
  ) { }

  async loadProject(): Promise<Project | null> {
    const selected = await open({
      multiple: false,
      filters: [{ name: 'index', extensions: ['xenoglosproj'] }]
    });

    if (typeof selected === 'string') {
      const content = await readTextFile(selected);
      
      // TODO: incluir validação de schema para json do projeto
      const project = JSON.parse(content);
      project.path = selected;
      return Promise.resolve(project);
    }

    return Promise.resolve(null);
  }

  async loadBook(project: Project, source: string, book: string): Promise<Book> {
    let resourcePath = '';

    if (/^@/.test(source)) {
      const repository = Object.keys(project.repositories).find(path => path === source.replace(/^@|\/[^ ]+$/, '')) || '';
      const folderName = source.replace(/^@[^ ]+\//, '');

      if (repository) {
        resourcePath = `${repository}/${folderName}/${book}.json`;

        if (!/^http/.test(repository)) {
          resourcePath = `sources/${resourcePath}`;
        }
      }
    } else {
      resourcePath = `sources/${source}/${book}.json`; 
    }

    if (/^http/.test(resourcePath)) {
      return firstValueFrom(this.httpClient.get<Book>(resourcePath));
    } else {
      return readTextFile(resourcePath);
    }
  }

  chooseFolder(): Promise<string> {
    return Promise.resolve('~/project');
  }

  saveProject(): Promise<void> {
    return Promise.resolve();
  }

  autoSaveCurrentProject(): void {
    SystemService.autoSaveCurrentProject.next();
  }
}
