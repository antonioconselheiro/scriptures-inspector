import { Book } from './book-model';
import { BookVerse } from './book-verse-model';

export type SourceBook = Book<object, BookVerse<{ text: string }>>