export interface ParsedPatterns {
  prefix: Map<string, RegExp>;
  suffix: Map<string, RegExp>;
  lexeme: Map<string, RegExp>;
}
