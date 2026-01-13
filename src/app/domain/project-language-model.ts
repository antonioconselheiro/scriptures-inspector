import { LanguageUnionType } from './language-union-type';

export interface ProjectLanguage {
  source: LanguageUnionType;
  target: string;
}
