import { ProjectStructureInterlinearEditor } from './project-structure-interlinear-editor-model';

export interface ProjectStructureMetadataEditor {
  source: string;
  target: string;
  customTranslationEditor: string | null;
  translationInterlinearEditor?: Array<ProjectStructureInterlinearEditor>;
}
