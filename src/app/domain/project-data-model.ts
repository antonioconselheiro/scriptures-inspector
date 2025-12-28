import { CodexBookMetadata } from './codex-book-metadata-model';
import { CodexBookChapterVerseMetadata } from './codex-book-chapter-verse-metadata-model';
import { CodexBookChapterVerse } from './codex-book-chapter-verse-model';
import { Codex } from './codex-model';
import { ProjectLanguage } from './project-language-model';
import { TranslationInterlinear } from './translation-interlinear-model';

export interface ProjectData {
  lang: ProjectLanguage;
  metadata: Codex<CodexBookMetadata, CodexBookChapterVerse<CodexBookChapterVerseMetadata>>;
  interlinear?: TranslationInterlinear;
  customTranslation?: Codex<{}, CodexBookChapterVerse<{ text: string, metadata?: string[] }>>;
}
