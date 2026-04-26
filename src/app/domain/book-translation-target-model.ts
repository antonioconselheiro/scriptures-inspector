import { Book } from './book-model';
import { BookTranslationTargetMetadata } from './book-translation-target-metadata-model';
import { BookVerse } from './book-verse-model';

export type BookTranslationTarget = Book<{
  variations: Record<string, { name: string }>
}, BookVerse<{
  text: string,
  variations: Record<string, Record<string, string>>,
  metadata: Array<BookTranslationTargetMetadata>
}>>;
