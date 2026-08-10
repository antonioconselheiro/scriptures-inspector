import { KeyInterlinear } from './key-interlinear-type';
import { ProjectStructureMetadata } from './project-structure-metadata-model';

export interface ProjectStructureInterlinear extends ProjectStructureMetadata {
  source: string;
  interlinearTarget: KeyInterlinear;
}
