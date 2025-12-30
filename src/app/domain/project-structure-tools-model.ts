import { ToolMetadataEditor } from './tool-metadata-editor-model';
import { ToolTranslationEditor } from './tool-translation-editor-model';
import { ToolTranslationViewer } from './tool-translation-viewer-model';

export interface ProjectStructureTools {
  editor: ToolMetadataEditor;
  translationInterlinear?: ToolTranslationEditor;
  translationViewer?: ToolTranslationViewer;
}
