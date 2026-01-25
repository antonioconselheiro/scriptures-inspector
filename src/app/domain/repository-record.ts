import { RepositoryLanguage } from './repository-language-model';

export type RepositoryRecord = {
  [language: string]: RepositoryLanguage;
}
