import { Injectable } from '@angular/core';
import { CurrentBook } from '@domain/current-book-model';
import { ProjectData } from '@domain/project-data-model';
import { Project } from '@domain/project-model';
import { readJsonFileFn } from '@shared/project/read-file-json-fn';
import { setProjectFn } from '@shared/project/set-project-fn';
import { writeJsonFileFn } from '@shared/project/write-json-file-fn';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SystemService {

  static saveCurrentProject = new Subject<void>();
  static saveCurrentBookMetadata = new Subject<CurrentBook>();
  static saveCurrentBookInterlinear = new Subject<CurrentBook>();
  static saveCurrentBookCustomTranslations = new Subject<CurrentBook>();

  static project: Project | null = null;

  async loadProject(): Promise<Project | null> {
    const selected = await window.api.openProject();

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

  async saveCurrentBookMetadata(project: Project, current: CurrentBook, data: ProjectData): Promise<void> {
    project.structure.forEach(async structure => await this.saveFile(project, structure.metadataEditor.target, current, data));
  }

  async saveCurrentBookInterlinear(project: Project, current: CurrentBook, data: ProjectData): Promise<void> {
    project.structure.forEach(async structure => {
      if (structure.interlinearEditor) {
        structure.interlinearEditor.forEach(async interlinear => await this.saveFile(project, interlinear.target, current, data));
      }
    });
  }

  async saveCurrentBookCustomTranslation(project: Project, current: CurrentBook, data: ProjectData): Promise<void> {
    project.structure.forEach(async structure => {
      if (structure.metadataEditor.customTranslationEditor) {
        await this.saveFile(project, structure.metadataEditor.customTranslationEditor, current, data);
      }

      if (structure.interlinearEditor) {
        structure.interlinearEditor.forEach(async interlinear => {
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

      writeJsonFileFn(`${SystemService.project.path}/index.xenoglosproj`, project);
    }

    return Promise.resolve();
  }

  triggerSaveCurrentProject(): void {
    SystemService.saveCurrentProject.next();
  }

  triggerSaveCurrentBookMetadata(currentBook: CurrentBook): void {
    SystemService.saveCurrentBookMetadata.next(currentBook);
  }

  triggerSaveCurrentBookInterlinear(currentBook: CurrentBook): void {
    SystemService.saveCurrentBookInterlinear.next(currentBook);
  }

  triggerSaveCurrentBookTranslations(currentBook: CurrentBook): void {
    SystemService.saveCurrentBookCustomTranslations.next(currentBook);
  }
}
