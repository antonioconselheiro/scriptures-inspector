import { MorphemeType } from '@domain/morpheme-type';

export interface PatternSegment {
  word: string;
  morpheme: MorphemeType;
  start: number;
  end: number;
}
