import { Book } from './book-model';
import { BookVerse } from './book-verse-model';

export type BookTranslation = Book<object, BookVerse<{ text: string, metadata?: string[] }>>