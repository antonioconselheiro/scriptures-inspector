import { PatternsSerialized } from './patterns-serialized';

export interface BookMetadataAttributes {
  patterns: PatternsSerialized;
  lexical: Record<string, string>;
}
