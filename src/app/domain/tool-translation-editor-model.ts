import { LanguageUnionType } from "./language-union-type";
import { ToolTranslationMetadataEditor } from "./tool-translation-metadata-editor-model";

export interface ToolTranslationEditor {
  tool: 'translation-editor';
  source: LanguageUnionType;
  target: LanguageUnionType;
  metadata?: ToolTranslationMetadataEditor;
}
