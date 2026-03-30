import { VerseNumberInterlinear } from './verse-number-interlinear-model';

export type BookVerse<Data extends object = object> = {
  verse: VerseNumberInterlinear;
} & Data;
