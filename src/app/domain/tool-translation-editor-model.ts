import { LanguageUnionType } from "./language-union-type";
import { ToolTranslationMetadataEditor } from "./tool-translation-metadata-editor-model";

export interface ToolTranslationEditor {
  tool: 'translation-editor';
  from: LanguageUnionType;
  to: LanguageUnionType;
  metadata?: ToolTranslationMetadataEditor;
}
