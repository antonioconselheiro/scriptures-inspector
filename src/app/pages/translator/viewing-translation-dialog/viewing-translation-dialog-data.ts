import { Codex } from '@domain/codex-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { Project } from '@domain/project-model';
import { RepositoryRecord } from '@domain/repository-record';

export interface ViewingTranslationDialogData {
  title: string;
  project: Project;
  codexMetadataRecord: Record<string, Codex<LanguageUnionType>>;
  repositories: RepositoryRecord;
}
