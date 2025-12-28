import { ParsedPatterns } from './parsed-patterns';

export interface ParsedBookMetadata {
  patterns: ParsedPatterns;
  lexical: Record<string, string>;
}