import { ProjectStructureMetadataEditor } from './project-structure-metadata-editor-model';
import { ProjectStructureInterlinearEditor } from './project-structure-interlinear-editor-model';
import { ProjectStructureTranslationViewer } from './project-structure-translation-viewer-model';

export interface ProjectStructure {
  translationViewer?: ProjectStructureTranslationViewer;
  metadataEditor: ProjectStructureMetadataEditor;
  interlinearEditor?: Array<ProjectStructureInterlinearEditor>;
}
