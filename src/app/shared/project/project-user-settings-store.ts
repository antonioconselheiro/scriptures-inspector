import { Injectable } from '@angular/core';
import { Project } from '@domain/project-model';
import { writeJsonFileFn } from './write-json-file-fn';

function isSettingsObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

@Injectable({
  providedIn: 'root'
})
export class ProjectUserSettingsStore {
  private filePath(project: Project): string {
    return `${project.path}/.scriptures-inspector`;
  }

  async load(project: Project): Promise<Record<string, unknown> | null> {
    const settings = await window.api.readOptionalJsonFile<unknown>(this.filePath(project));
    if (settings === null) {
      return null;
    }
    if (!isSettingsObject(settings)) {
      throw new Error('Project user settings must contain a JSON object.');
    }
    return settings;
  }

  async save(project: Project, key: string, value: object): Promise<void> {
    const current = await this.load(project) ?? {};
    await writeJsonFileFn(this.filePath(project), { ...current, [key]: value });
  }
}
