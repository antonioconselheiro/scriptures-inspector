import { BookVerse } from './book-verse-model';

export type Book<BookAttributes extends object = object, Verse extends object = BookVerse> = {
  chapters: Array<Array<Verse>>;
} & BookAttributes;
