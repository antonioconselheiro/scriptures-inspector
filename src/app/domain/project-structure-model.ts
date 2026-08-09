import { ProjectStructureInterlinear } from './project-structure-interlinear-model';
import { ProjectStructureMetadata } from './project-structure-metadata-model';

export interface ProjectStructure {
  metadata: ProjectStructureMetadata;
  interlinear?: Array<ProjectStructureInterlinear>;
}
