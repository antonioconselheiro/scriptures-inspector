import { RepositoryLanguage } from './repository-language-model';

export type RepositoryRecord = {
  [lang: string]: RepositoryLanguage
}
