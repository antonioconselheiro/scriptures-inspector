import { Injectable } from '@angular/core';
import { Project } from '@domain/project-model';
import { Subject } from 'rxjs';

// TODO: integrar com tauri
@Injectable({
  providedIn: 'root'
})
export class SystemService {

  static autoSaveCurrentProject = new Subject<void>();

  loadProject(): Promise<Project> {
    return Promise.resolve({
      name: 'Tradução da Bíblia',
      referenceBooks: [],
      workingBooks: [],
      data: [
        {
          lang: {
            source: 'hebrew',
            target: [
              'portuguese'
            ]
          },

          metadata: {}
        }
      ],
      structure: {
        name: '',
        tools: {
          editor: {

          },
          translationInterlinear: {
            
          },
          translationViewer: {

          }
        }
      }
    });
  }

  loadBook(path: string): string {

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
