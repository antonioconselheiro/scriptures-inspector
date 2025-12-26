import { PatternsSerialized } from "./patterns-serialized";

export interface CodexBookChapterMetadata {
  patterns: PatternsSerialized;
  lexical: Record<string, string>;
}
