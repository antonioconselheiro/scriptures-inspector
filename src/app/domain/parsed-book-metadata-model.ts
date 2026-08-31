import { BookMetadataAttributesLexicalModel } from './book-metadata-attributes-lexical-model';
import { ParsedPatterns } from './parsed-patterns';

export interface ParsedBookMetadata {
  patterns: ParsedPatterns;
  lexical: Record<string, BookMetadataAttributesLexicalModel>;
}
