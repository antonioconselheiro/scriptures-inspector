import { LanguageUnionType } from './language-union-type';
import { ProjectStructureInterlinearEditor } from './project-structure-interlinear-editor-model';
import { ProjectStructureMetadataEditor } from './project-structure-metadata-editor-model';

export interface ProjectStructure {
  lang: LanguageUnionType;
  translationViewer?: Array<string>;
  metadataEditor: ProjectStructureMetadataEditor;
  interlinearEditor?: Array<ProjectStructureInterlinearEditor>;
}
