import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Book } from '@domain/book-model';
import { Project } from '@domain/project-model';
import { firstValueFrom, Subject } from 'rxjs';
import { writeTextFile, readTextFile, BaseDirectory } from '@tauri-apps/api/fs';
import { open } from '@tauri-apps/api/dialog';

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
    if (/^@/.test(source)) {
      const repository = project.repositories.find(repository => repository.path === source.replace(/^@|\/[^ ]+$/, ''))?.repository || '';
      const folder = source.replace(/^@[^ ]+\//, '');

    } else {
      
    }


    return firstValueFrom(this.httpClient.get<Book>(`${repository}/${folder}/${book}.json`));
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
