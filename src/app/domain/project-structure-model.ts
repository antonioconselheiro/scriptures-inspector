import { ProjectStructureInterlinearEditor } from './project-structure-interlinear-editor-model';
import { ProjectStructureMetadataEditor } from './project-structure-metadata-editor-model';

export interface ProjectStructure {
  metadataEditor: ProjectStructureMetadataEditor;
  interlinearEditor?: Array<ProjectStructureInterlinearEditor>;
}
