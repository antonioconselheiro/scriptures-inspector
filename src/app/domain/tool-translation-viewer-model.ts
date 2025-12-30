import { LanguageUnionType } from './language-union-type';

export interface ToolTranslationViewer {
  tool: 'translation-viewer';
  lang: LanguageUnionType;
  book: string;
}
