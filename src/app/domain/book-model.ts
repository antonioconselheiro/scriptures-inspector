import { BookVerse } from './book-verse-model';

export type Book<BookAttributes extends object = object, Verse extends object = BookVerse> = {
  chapters: Array<{
    chapter: number;
    verses: Array<Verse>
  }>;
} & BookAttributes;
