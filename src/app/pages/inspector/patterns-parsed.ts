export interface PatternsParsed {
  prefix: Array<{ word: string; pattern: RegExp }>;
  suffix: Array<{ word: string; pattern: RegExp }>;
}
