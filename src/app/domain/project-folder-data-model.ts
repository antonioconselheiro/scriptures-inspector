import { Codex } from './codex-model';
import { CodexBookChapterVerse } from './codex-book-chapter-verse-model';
import { ScriptureVerseMetadata } from './scripture-verse-metadata-model';
import { TranslationInterlinearVerse } from './translation-interlinear-verse-model';
import { PatternsSerialized } from './patterns-serialized';

export interface ProjectFolderData {
  metadata: Codex<CodexBookChapterVerse<ScriptureVerseMetadata>, { patterns: PatternsSerialized }>;
  lexical: Record<string, string>;
  customTranslation: Codex<CodexBookChapterVerse<{ text: string, metadata?: string[] }>>;
  interlinear: {
    [book: string]: Array<Array<Array<TranslationInterlinearVerse>>>
  }
}
