import { BookMetadataAttributesLexicalModel } from './book-metadata-attributes-lexical-model';
import { PatternsSerialized } from './patterns-serialized-model';

export interface BookMetadataAttributes {
  patterns: PatternsSerialized;
  lexical: Record<string, BookMetadataAttributesLexicalModel>;
}
