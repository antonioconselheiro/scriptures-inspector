import { ProjectStructureTranslationInterlinearEditor } from './project-structure-translation-interlinear-editor-model';

export interface ProjectStructureMetadataEditor {
  source: string;
  customTranslationEditor: boolean;
  translationInterlinearEditor?: Array<ProjectStructureTranslationInterlinearEditor>;
}
