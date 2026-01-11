import { BookMetadata } from './book-metadata-model';
import { BookVerse } from './book-verse-model';
import { CodexRecord } from './codex-record';
import { TranslationInterlinearVerse } from './translation-interlinear-verse-model';

export interface TranslationInterlinear {
  codex: CodexRecord<BookMetadata, Array<TranslationInterlinearVerse>>;
  customTranslation?: CodexRecord<object, BookVerse<{ text: string, metadata?: string[] }>>;
}
