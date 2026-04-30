import { Book } from './book-model';
import { BookVerseTranslationTarget } from './book-verse-translation-target-model';

export type BookTranslationTarget = Book<{
  variations: Record<string, { name: string }>
}, BookVerseTranslationTarget>;
