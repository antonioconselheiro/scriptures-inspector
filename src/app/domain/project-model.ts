import { AssociatedTranslation } from './associated-translation-model';
import { ProjectStructureMetadata } from './project-structure-metadata-model';
import { ProjectTarget } from './project-target-model';

export interface Project {
  name: string;
  readonly path: string;
  repositories?: { [alias: string]: string };
  target: ProjectTarget;
  translationViewer?: Array<AssociatedTranslation>;
  structures: Array<ProjectStructureMetadata>;
}
