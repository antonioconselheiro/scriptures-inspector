import { BookMetadataAttributesLexicalModel } from './book-metadata-attributes-lexical-model';
import { PatternsSerialized } from './patterns-serialized';

export interface BookMetadataAttributes {
  patterns: PatternsSerialized;
  lexical: Record<string, BookMetadataAttributesLexicalModel>;
}
