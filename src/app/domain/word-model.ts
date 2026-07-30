import { WordSegment } from './word-segment-model';

export interface Word {
  segments: Array<WordSegment>;
  separator?: string;
}