import { AssociatedTranslation } from './associated-translation-model';
import { LanguageUnionType } from './language-union-type';
import { NormalizationType } from './normalization-type';
import { ProjectStructureMetadata } from './project-structure-metadata-model';
import { ProjectTarget } from './project-target-model';

export interface Project {
  name: string;
  readonly path: string;
  repositories?: { [alias: string]: string };
  normalization?: Partial<Record<LanguageUnionType, NormalizationType[]>>;
  target: ProjectTarget;
  translationViewer?: Array<AssociatedTranslation>;
  structures: Array<ProjectStructureMetadata>;
}
