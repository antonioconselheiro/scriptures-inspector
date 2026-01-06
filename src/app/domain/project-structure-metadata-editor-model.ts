import { ProjectStructureInterlinearEditor } from './project-structure-interlinear-editor-model';

export interface ProjectStructureMetadataEditor {
  source: string;
  customTranslationEditor: boolean;
  translationInterlinearEditor?: Array<ProjectStructureInterlinearEditor>;
}
