import { Project } from '@domain/project-model';

export function getProjectViewingTranslationFn(project: Project): Array<string> {
  return project.structure.map(structure => structure.translationViewer || []).flat();
}
