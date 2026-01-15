import { RepositoryTranslationRecord } from './repository-translation-record';

export interface RepositoryLanguage {
  key: string;
  name: string;
  translations: RepositoryTranslationRecord;
}