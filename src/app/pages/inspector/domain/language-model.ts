import { LanguageAlternativeSpelling } from './language-alternative-spelling-model';
import { LanguageNumerology } from './language-numerology-model';

export interface Language {
  name: string;
  label: string;
  font?: string;
  direction?: 'ltr' | 'rtl';
  transliteration?: (text: string) => string;
  numerology?: Array<LanguageNumerology>;
  normalizeFn?: (text: string) => string;
  parsePattern?: (text: string) => RegExp;
  spelling?: Array<LanguageAlternativeSpelling>;
  dictionaryLink?: string;
}
