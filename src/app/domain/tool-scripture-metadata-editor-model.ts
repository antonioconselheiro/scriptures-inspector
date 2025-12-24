import { languageUnion } from "./language-union";

export interface ToolScriptureMetadataEditor {
  tool: 'scripture-metadata-editor';
  lang: languageUnion;
  transliteration?: boolean;
  GodSaid?: boolean;
  metadata?: boolean;
  interlinear?: boolean;
  numerology?: boolean;
  spelling?: boolean;
}
