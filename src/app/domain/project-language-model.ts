import { Language } from './language-model';

export interface ProjectLanguage {
  source: Language;
  target: Array<Language>;
}
