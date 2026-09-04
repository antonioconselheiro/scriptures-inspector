import { MorphemeType } from './morpheme-type';

export interface WordSegment {
  index: number;
  morpheme: MorphemeType;
  word: string;
}
