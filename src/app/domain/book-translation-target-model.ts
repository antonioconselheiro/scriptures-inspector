import { Book } from './book-model';
import { BookTranslationTargetMetadata } from './book-translation-target-metadata-model';
import { BookVerse } from './book-verse-model';

export type BookTranslationTarget = Book<object, BookVerse<{ text: string, metadata: Array<BookTranslationTargetMetadata> }>>;
