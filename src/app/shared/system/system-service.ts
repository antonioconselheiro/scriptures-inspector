import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Book } from '@domain/book-model';
import { Project } from '@domain/project-model';
import { open as openFile } from '@tauri-apps/plugin-fs';
import { open as openDialog } from '@tauri-apps/plugin-dialog';
import { firstValueFrom, Subject } from 'rxjs';
import { BookMetadata } from '@domain/book-metadata-model';
import { TranslationInterlinearVerse } from '@domain/translation-interlinear-verse-model';
import { BookVerse } from '@domain/book-verse-model';

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

  async saveProjectBook(project: Project, book: string): Promise<void> {
    (project.data || []).forEach(async data => {
      const metadata = data.metadata[book];
      const interlineares = data.interlineares;
      const customTranslationBook = data.customTranslation && data.customTranslation[book] || null;

      if (interlineares) {
        Object.keys(interlineares || {}).forEach(async source => {
          const file = await openFile(`${project.path}/target/?/${book}.json`, { write: true });
          await file.write(new TextEncoder().encode(JSON.stringify(interlineares[source].codex[book], null, 2)));
          await file.close();

          if (interlineares[source].customTranslations && interlineares[source].customTranslations[book]) {
            const file = await openFile(`${project.path}/target/?/${book}.json`, { write: true });
            await file.write(new TextEncoder().encode(JSON.stringify(interlineares[source].customTranslations[book], null, 2)));
            await file.close();
          }
        });
      }

      if (metadata) {
        const file = await openFile(`${project.path}/target/?/${book}.json`, { write: true });
        await file.write(new TextEncoder().encode(JSON.stringify(metadata, null, 2)));
        await file.close();
      }
      
    });
  }

  async saveProjectConfig(): Promise<void> {
    if (SystemService.project) {
      const project: any = { ...SystemService.project };
      delete project.data;
      delete project.path;

      const file = await openFile(SystemService.project.path, { write: true });
      file.write(new TextEncoder().encode(JSON.stringify(project, null, 2)));
    }

    return Promise.resolve();
  }

  autoSaveCurrentProject(): void {
    SystemService.autoSaveCurrentProject.next();
  }
}
