import { Injectable } from '@angular/core';
import { CurrentBook } from '@domain/current-book-model';
import { ProjectData } from '@domain/project-data-model';
import { Project } from '@domain/project-model';
import { readJsonFileFn } from '@shared/project/read-json-file-fn';
import { setProjectFn } from '@shared/project/set-project-fn';
import { writeJsonFileFn } from '@shared/project/write-json-file-fn';
import { open as openDialog } from '@tauri-apps/plugin-dialog';
import { open as openFile } from '@tauri-apps/plugin-fs';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SystemService {

  static autoSaveCurrentProject = new Subject<void>();

  static project: Project | null = null;

  async loadProject(): Promise<Project | null> {
    const selected = await openDialog({
      multiple: false,
      filters: [{
        name: 'index',
        extensions: ['xenoglosproj']
      }]
    });

    if (typeof selected === 'string') {
      const project = await readJsonFileFn<any>(selected);

      if (project) {
        // TODO: incluir validação de schema para json do projeto
        project.path = selected.replace(/\/index.xenoglosproj$/, '');
        return Promise.resolve(project);
      }
    }

    return Promise.resolve(null);
  }

  chooseFolder(): Promise<string> {
    return Promise.resolve('~/project');
  }

  async saveCurrentBook(project: Project, current: CurrentBook, data: ProjectData): Promise<void> {
    project.structure.forEach(async structure => {
      await this.saveFile(project, structure.metadataEditor.target, current, data);

      if (structure.metadataEditor.customTranslationEditor) {
        await this.saveFile(project, structure.metadataEditor.customTranslationEditor, current, data);
      }

      if (structure.interlinearEditor) {
        structure.interlinearEditor.forEach(async interlinear => {
          await this.saveFile(project, interlinear.target, current, data);

          if (interlinear.customTranslationEditor) {
            await this.saveFile(project, interlinear.customTranslationEditor, current, data);
          }
        });
      }
    });
  }

  private async saveFile(project: Project, target: string, current: CurrentBook, content: ProjectData): Promise<void> {
    await writeJsonFileFn(`${project.path}/targets/${target}/${current.book}.json`, content[target]);
  }

  async saveProjectConfig(): Promise<void> {
    if (SystemService.project) {
      const project: any = { ...SystemService.project };
      delete project.path;
      setProjectFn(project);

      const file = await openFile(SystemService.project.path, { write: true });
      file.write(new TextEncoder().encode(JSON.stringify(project, null, 2)));
    }

    return Promise.resolve();
  }

  autoSaveCurrentProject(): void {
    SystemService.autoSaveCurrentProject.next();
  }
}
