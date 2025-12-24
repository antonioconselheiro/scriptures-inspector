import { ToolScriptureMetadataEditor } from "./tool-scripture-metadata-editor-model";
import { ToolTranslationEditor } from "./tool-translation-editor-model";
import { ToolTranslationViewer } from "./tool-translation-viewer-model";

export interface ProjectSchemas {
  name: string;
  schemas: Array<ToolTranslationViewer | ToolScriptureMetadataEditor | ToolTranslationEditor>;
}
