import { BookVerse } from './book-verse-model';

export interface TranslationViewing {
  name: string;
  source: string;
  chapters: Array<Array<Readonly<BookVerse<{
    text: string;
  }>>>>;
}
