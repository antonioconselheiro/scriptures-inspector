import { PatternsSerialized } from './patterns-serialized';

export interface BookMetadata {
  patterns: PatternsSerialized;
  lexical: Record<string, string>;
}
