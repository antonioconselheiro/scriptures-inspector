import { BookVerse } from './book-verse-model';

export interface TranslationViewing {
  name: string;
  source: string;
  associatedTo: Array<string>;
  chapters: Array<Readonly<{
    chapter: number;
    verses: Array<Readonly<{
      verse: `${number}`;
      text: string;
    }>>
  }>>;
}
