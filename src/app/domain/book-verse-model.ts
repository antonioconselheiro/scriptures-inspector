import { VerseNumber } from './verse-number-model';

export type BookVerse<Data extends object = object> = {
  verse: VerseNumber;
} & Data;
