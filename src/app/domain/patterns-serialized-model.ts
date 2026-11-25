export interface DistinctPattern {
  prefix?: string;
  suffix?: string;
}

export interface PatternsSerialized {
  distinct?: Record<string, DistinctPattern>;
  wordDistinct?: Record<string, DistinctPattern>;
  prefix: Array<string>;
  suffix: Array<string>;
  lexeme: Array<string>;
}