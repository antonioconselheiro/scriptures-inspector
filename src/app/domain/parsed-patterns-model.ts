import { DistinctPattern } from './patterns-serialized-model';

export interface ParsedPatterns {
  distinct: Map<string, DistinctPattern>;
  prefix: Map<string, RegExp>;
  suffix: Map<string, RegExp>;
  lexeme: Map<string, RegExp>;
}
