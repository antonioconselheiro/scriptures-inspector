export interface WordSegment {
  index: number;
  morpheme: 'root' | 'suffix' | 'prefix';
  word: string;
}
