import { ProjectStructureMetadataEditor } from './project-structure-metadata-editor-model';
import { ProjectStructureTranslationInterlinearEditor } from './project-structure-translation-interlinear-editor-model';
import { ProjectStructureTranslationViewer } from './project-structure-translation-viewer-model';

export interface ProjectStructure {
  target: Array<string>;
  translationViewer?: ProjectStructureTranslationViewer;
  metadataEditor: ProjectStructureMetadataEditor;
  translationInterlinearEditor?: ProjectStructureTranslationInterlinearEditor;
}
