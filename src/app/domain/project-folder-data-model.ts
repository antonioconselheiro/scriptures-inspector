import { Codex } from './codex-model';
import { CodexBookChapterMetadata } from './codex-book-chapter-metadata-model';
import { CodexBookChapterVerseMetadata } from './codex-book-chapter-verse-metadata-model';
import { CodexBookChapterVerse } from './codex-book-chapter-verse-model';
import { TranslationInterlinear } from './translation-interlinear-model';

export interface ProjectFolderData {
  metadata: Codex<CodexBookChapterVerse<CodexBookChapterVerseMetadata>, CodexBookChapterMetadata>;
  customTranslation?: Codex<CodexBookChapterVerse<{ text: string, metadata?: string[] }>>;
  interlinear: TranslationInterlinear;
}
