import { Codex } from './codex-model';
import { CodexBookMetadata } from './codex-book-metadata-model';
import { CodexBookChapterVerseMetadata } from './codex-book-chapter-verse-metadata-model';
import { CodexBookVerse } from './codex-book-verse-model';
import { ProjectLanguage } from './project-language-model';
import { TranslationInterlinear } from './translation-interlinear-model';

export interface ProjectData {
  lang: ProjectLanguage;
  metadata: Codex<CodexBookMetadata, CodexBookVerse<CodexBookChapterVerseMetadata>>;
  interlinear?: Array<TranslationInterlinear>;
  customTranslation?: Codex<object, CodexBookVerse<{ text: string, metadata?: string[] }>>;
}
