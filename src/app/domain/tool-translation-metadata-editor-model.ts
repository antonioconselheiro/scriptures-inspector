import { languageUnion } from "./language-union";

export interface ToolTranslationMetadataEditor {
  tool: 'translation-metadata-editor';
  lang: languageUnion;
}
