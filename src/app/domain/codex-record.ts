import { Book } from './book-model';
import { BookVerse } from './book-verse-model';

export type CodexRecord<BookMetadata extends object = object, VerseMetadata extends object = BookVerse> = {
  [bookKey: string]: Book<BookMetadata, VerseMetadata>
}
