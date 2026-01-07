import { Book } from './book-model';
import { BookVerse } from './book-verse-model';

export type CodexRecord<Chapter extends object = object, Verse extends object = BookVerse> = {
  [bookKey: string]: Book<Chapter, Verse>
}
