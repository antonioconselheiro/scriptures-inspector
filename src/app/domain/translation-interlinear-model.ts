import { CodexBookVerse } from './codex-book-verse-model';
import { Codex } from './codex-model';
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

  customTranslation?: Codex<object, CodexBookVerse<{ text: string, metadata?: string[] }>>;
  codex: Codex<object, Array<TranslationInterlinearVerse>>;
}
