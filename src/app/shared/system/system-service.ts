import { Injectable } from '@angular/core';
import { CurrentBook } from '@domain/current-book-model';
import { KeyInterlinear } from '@domain/key-interlinear-type';
import { KeyMetadata } from '@domain/key-metadata-type';
import { KeyTranslation } from '@domain/key-translation-type';
import { ProjectData } from '@domain/project-data-model';
import { Project } from '@domain/project-model';
import { ProjectStructureMetadata } from '@domain/project-structure-metadata-model';
import { readJsonFileFn } from '@shared/project/read-file-json-fn';
import { setProjectFn } from '@shared/project/set-project-fn';
import { writeJsonFileFn } from '@shared/project/write-json-file-fn';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SystemService {

  static readonly autoSaveDebounceTime = 5000; 

  static saveCurrentProject = new Subject<void>();
  static saveCurrentBookMetadata = new Subject<CurrentBook>();
  static saveCurrentBookInterlinear = new Subject<CurrentBook>();
  static saveCurrentBookCustomTranslations = new Subject<CurrentBook>();

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
    for (const structure of project.structures) {
      await this.saveBookFile(project, structure.metadataTarget, current, data);

      if (structure.interlinear) {
        for (const interlinear of structure.interlinear) {
          await this.saveBookFile(project, interlinear.metadataTarget, current, data);
        }
      }
    }
  }

  async saveCurrentBookInterlinear(project: Project, structures: Array<ProjectStructureMetadata>, current: CurrentBook, data: ProjectData): Promise<void> {
    for (const structure of structures) {
      if (structure.interlinear) {
        for (const interlinearStructure of structure.interlinear) {
          await this.saveBookFile(project, interlinearStructure.interlinearTarget, current, data);
          await this.saveCurrentBookInterlinear(project, [interlinearStructure], current, data);
        }
      }
    }
  }

  async saveCurrentBookCustomTranslation(project: Project, current: CurrentBook, data: ProjectData): Promise<void> {
    for (const structure of project.structures) {
      if (structure.customTranslationTarget) {
        await this.saveBookFile(project, structure.customTranslationTarget, current, data);
      }

      if (structure.interlinear) {
        for (const interlinear of structure.interlinear) {
          if (interlinear.customTranslationTarget) {
            await this.saveBookFile(project, interlinear.customTranslationTarget, current, data);
          }
        }
      }
    }
  }

  private async saveBookFile(
    project: Project,
    target: KeyMetadata | KeyTranslation | KeyInterlinear,
    current: CurrentBook,
    content: ProjectData
  ): Promise<void> {
    return writeJsonFileFn(`${project.path}/targets/${target}/${current.book}.json`, content[target]).catch(e => console.error('Error writting file:', e));
  }

  async saveProjectConfig(project: Project): Promise<void> {
    if (project) {
      const projectClonedObject: any = { ...project };
      delete projectClonedObject.path;
      setProjectFn(project);

      writeJsonFileFn(`${project.path}/index.xenoglosproj`, projectClonedObject);
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
