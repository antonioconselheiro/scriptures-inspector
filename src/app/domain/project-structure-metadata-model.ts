import { KeyTranslation } from './key-translation-type';
import { KeyMetadata } from './key-metadata-type';
import { ProjectStructureInterlinear } from './project-structure-interlinear-model';

export interface ProjectStructureMetadata {
  source: string;
  metadataTarget: KeyMetadata;
  customTranslationTarget?: KeyTranslation;
  interlinear?: Array<ProjectStructureInterlinear>;
}
