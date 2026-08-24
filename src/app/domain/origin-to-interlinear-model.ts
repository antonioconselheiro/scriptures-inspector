import { LanguageUnionType } from './language-union-type';
import { ProjectStructureInterlinear } from './project-structure-interlinear-model';
import { ProjectStructureMetadata } from './project-structure-metadata-model';
import { SourceVerse } from './source-verse-model';

export interface OriginToInterlinear {
  language: LanguageUnionType;
  structure: ProjectStructureMetadata | ProjectStructureInterlinear;
  verse: SourceVerse;
}