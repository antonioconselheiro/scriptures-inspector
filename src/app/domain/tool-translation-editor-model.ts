import { languageUnion } from "./language-union";
import { ToolTranslationMetadataEditor } from "./tool-translation-metadata-editor-model";

export interface ToolTranslationEditor {
  tool: 'translation-editor';
  from: languageUnion;
  to: languageUnion;
  metadata?: ToolTranslationMetadataEditor;
}
