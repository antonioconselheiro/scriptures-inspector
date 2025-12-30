import { LanguageUnionType } from "./language-union-type";

export interface ToolMetadataEditor {
  tool: 'metadata-editor';
  lang: LanguageUnionType;
  transliteration?: boolean;
  GodSaid?: boolean;
  metadata?: boolean;
  interlinear?: boolean;
  numerology?: boolean;
  spelling?: boolean;
}
