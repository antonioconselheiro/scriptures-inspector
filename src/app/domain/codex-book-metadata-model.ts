import { PatternsSerialized } from './patterns-serialized';

export interface CodexBookMetadata {
  patterns: PatternsSerialized;
  lexical: Record<string, string>;
}
