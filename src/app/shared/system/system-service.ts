import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Book } from '@domain/book-model';
import { Project } from '@domain/project-model';
import { open as openFile } from '@tauri-apps/plugin-fs';
import { open as openDialog } from '@tauri-apps/plugin-dialog';
import { firstValueFrom, Subject } from 'rxjs';

// TODO: integrar com tauri
@Injectable({
  providedIn: 'root'
})
export class SystemService {

  static autoSaveCurrentProject = new Subject<void>();

  static project: Project | null = null;

  constructor(
    private httpClient: HttpClient
  ) { }

  async loadProject(): Promise<Project | null> {

    const selected = await openDialog({
      multiple: false,
      filters: [{
        name: 'index',
        extensions: ['xenoglosproj']
      }]
    });


    if (typeof selected === 'string') {
      const file = await openFile(selected, { read: true });

      if (file) {
        const fileStat = await file.stat()
        const buf = new Uint8Array(fileStat.size);
        await file.read(buf);
        const content = new TextDecoder().decode(buf);
        await file.close();
  
        // TODO: incluir validação de schema para json do projeto
        const project = JSON.parse(content);
        project.path = selected;
        return Promise.resolve(project);
      }
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
      const file = await openFile(resourcePath, { read: true });
      const fileStat = await file.stat();
      const buf = new Uint8Array(fileStat.size);
      await file.read(buf);
      const content = new TextDecoder().decode(buf);
      await file.close();

      // TODO: incluir validação de schema para json do projeto
      const project = JSON.parse(content);
      return Promise.resolve(project);

    }
  }

  chooseFolder(): Promise<string> {
    return Promise.resolve('~/project');
  }

  saveProjectBook(book: string): Promise<void> {

  }

  saveProject(): Promise<void> {
    if (SystemService.project) {
      const project = { ...SystemService.project };
      delete project.data;
      delete project.path;
    }

    return Promise.resolve();
  }

  autoSaveCurrentProject(): void {
    SystemService.autoSaveCurrentProject.next();
  }
}
