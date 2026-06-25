import { BookVerseTranslationTargetVariations } from './book-verse-translation-target-variations-model';
import { BookTranslationTargetMetadata } from './book-translation-target-metadata-model';
import { BookVerse } from './book-verse-model';

export type BookVerseTranslationTarget = BookVerse<{
  text: string;
  variations: BookVerseTranslationTargetVariations;
  metadata: Array<BookTranslationTargetMetadata>;
}>
