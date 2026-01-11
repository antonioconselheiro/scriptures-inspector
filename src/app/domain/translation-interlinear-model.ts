import { BookMetadata } from './book-metadata-model';
import { BookVerse } from './book-verse-model';
import { CodexRecord } from './codex-record';
import { TranslationInterlinearVerse } from './translation-interlinear-verse-model';

export interface TranslationInterlinear {
  name?: string;

  /**
   * name of source codex
   */
  source: string;

  /**
   * any language
   */
  target: string;

  customTranslation?: CodexRecord<object, BookVerse<{ text: string, metadata?: string[] }>>;
  codex: CodexRecord<BookMetadata, Array<TranslationInterlinearVerse>>;
}
