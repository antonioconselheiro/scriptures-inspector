import { BookTranslationTargetMetadata } from './book-translation-target-metadata-model';
import { BookVerse } from './book-verse-model';

export type BookVerseTranslationTarget = BookVerse<{
  text: string;
  variations: Record<string, Record<string, string>>;
  metadata: Array<BookTranslationTargetMetadata>;
}>
