import { ToolMetadataEditor } from "./tool-metadata-editor-model";
import { ToolTranslationEditor } from "./tool-translation-editor-model";
import { ToolTranslationViewer } from "./tool-translation-viewer-model";

export interface ProjectStructure {
  name: string;
  tools: Array<ToolTranslationViewer | ToolMetadataEditor | ToolTranslationEditor>;
}
