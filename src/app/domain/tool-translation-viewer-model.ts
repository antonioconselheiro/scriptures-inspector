import { languageUnion } from './language-union';

export interface ToolTranslationViewer {
  tool: 'translation-viewer';
  lang: languageUnion;
  book: string;
}
