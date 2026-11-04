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

  static readonly autoSaveDebounceTime = 3000; 

  static saveCurrentProject = new Subject<void>();
  static saveCurrentBookMetadata = new Subject<CurrentBook>();
  static saveCurrentBookInterlinear = new Subject<CurrentBook>();
  static saveCurrentBookCustomTranslations = new Subject<CurrentBook>();

  private immediateSaveHandler: (() => Promise<void>) | null = null;

  registerImmediateSaveHandler(handler: () => Promise<void>, onlyIfEmpty = false): () => void {
    if (!onlyIfEmpty || !this.immediateSaveHandler) {
      this.immediateSaveHandler = handler;
    }

    return () => {
      if (this.immediateSaveHandler === handler) {
        this.immediateSaveHandler = null;
      }
    };
  }

  async saveCurrentPageImmediately(): Promise<void> {
    await this.immediateSaveHandler?.();
  }

  async loadProject(): Promise<Project | null> {
    const selected = await window.api.openProject();

    if (typeof selected === 'string') {
      return this.loadProjectFromPath(selected);
    }

    return null;
  }

  async loadProjectFromPath(filePath: string): Promise<Project | null> {
    const project = await readJsonFileFn<Omit<Project, 'path'>>(filePath);
    if (!project) {
      return null;
    }

    const lastSeparator = Math.max(filePath.lastIndexOf('/'), filePath.lastIndexOf('\\'));
    let projectDirectory = '.';
    if (lastSeparator === 0) {
      projectDirectory = filePath.slice(0, 1);
    } else if (lastSeparator === 2 && filePath[1] === ':') {
      projectDirectory = filePath.slice(0, 3);
    } else if (lastSeparator > 0) {
      projectDirectory = filePath.slice(0, lastSeparator);
    }

    return {
      ...project,
      path: projectDirectory
    };
  }

  async saveCurrentBookMetadata(project: Project, current: CurrentBook, data: ProjectData): Promise<void> {
    const targets = this.getMetadataTargets(project.structures);
    await this.saveBookTargets(project, targets, current, data);
  }

  async saveCurrentBookInterlinear(project: Project, structures: Array<ProjectStructureMetadata>, current: CurrentBook, data: ProjectData): Promise<void> {
    const targets = this.getInterlinearTargets(structures);
    await this.saveBookTargets(project, targets, current, data);
  }

  async saveCurrentBookCustomTranslation(project: Project, current: CurrentBook, data: ProjectData): Promise<void> {
    const targets = this.getCustomTranslationTargets(project.structures);
    await this.saveBookTargets(project, targets, current, data);
  }

  async saveProjectImmediately(project: Project, current: CurrentBook | null, data: ProjectData): Promise<void> {
    const saves: Promise<void>[] = [this.saveProjectConfig(project)];
    if (current) {
      saves.push(
        this.saveCurrentBookMetadata(project, current, data),
        this.saveCurrentBookInterlinear(project, project.structures, current, data),
        this.saveCurrentBookCustomTranslation(project, current, data)
      );
    }

    const results = await Promise.allSettled(saves);
    const errors = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map(result => result.reason);
    if (errors.length) {
      throw new AggregateError(errors, 'One or more project files could not be saved');
    }
  }

  private async saveBookFile(
    project: Project,
    target: KeyMetadata | KeyTranslation | KeyInterlinear,
    current: CurrentBook,
    content: ProjectData
  ): Promise<void> {
    const targetData = content[target];
    if (!targetData) {
      throw new Error(`Missing project data for target "${target}"`);
    }
    await writeJsonFileFn(`${project.path}/targets/${target}/${current.book}.json`, targetData);
  }

  private async saveBookTargets(
    project: Project,
    targets: Array<KeyMetadata | KeyInterlinear | KeyTranslation>,
    current: CurrentBook,
    data: ProjectData
  ): Promise<void> {
    const results = await Promise.allSettled(
      targets.map(target => this.saveBookFile(project, target, current, data))
    );
    const errors = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map(result => result.reason);
    if (errors.length) {
      throw new AggregateError(errors, 'One or more book files could not be saved');
    }
  }

  private getMetadataTargets(structures: Array<ProjectStructureMetadata>): KeyMetadata[] {
    return structures.flatMap(structure => [
      structure.metadataTarget,
      ...this.getMetadataTargets(structure.interlinear ?? [])
    ]);
  }

  private getInterlinearTargets(structures: Array<ProjectStructureMetadata>): KeyInterlinear[] {
    return structures.flatMap(structure => [
      ...(structure.interlinear ?? []).flatMap(interlinear => [
        interlinear.interlinearTarget,
        ...this.getInterlinearTargets([interlinear])
      ])
    ]);
  }

  private getCustomTranslationTargets(structures: Array<ProjectStructureMetadata>): KeyTranslation[] {
    return structures.flatMap(structure => [
      ...(structure.customTranslationTarget ? [structure.customTranslationTarget] : []),
      ...this.getCustomTranslationTargets(structure.interlinear ?? [])
    ]);
  }

  async saveProjectConfig(project: Project): Promise<void> {
    if (project) {
      const projectClonedObject: any = { ...project };
      delete projectClonedObject.path;
      setProjectFn(project);

      await writeJsonFileFn(`${project.path}/index.xenoglosproj`, projectClonedObject);
    }
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
