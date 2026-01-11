import { Book } from './book-model';
import { BookVerse } from './book-verse-model';

export type SourceBook = Readonly<Book<object, BookVerse<{ text: string }>>>;