import { languageUnion } from "./language-union";

export interface ToolMetadataEditor {
  tool: 'metadata-editor';
  lang: languageUnion;
  transliteration?: boolean;
  GodSaid?: boolean;
  metadata?: boolean;
  interlinear?: boolean;
  numerology?: boolean;
  spelling?: boolean;
}
