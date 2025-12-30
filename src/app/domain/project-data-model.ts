import { CodexBookChapterVerseMetadata } from './codex-book-chapter-verse-metadata-model';
import { CodexBookMetadata } from './codex-book-metadata-model';
import { CodexBookVerse } from './codex-book-verse-model';
import { Codex } from './codex-model';
import { LanguageUnionType } from './language-union-type';
import { ProjectLanguage } from './project-language-model';
import { TranslationInterlinear } from './translation-interlinear-model';

export interface ProjectData {
  lang: ProjectLanguage;
  metadata: Codex<CodexBookMetadata, CodexBookVerse<CodexBookChapterVerseMetadata>>;
  interlinear?: Array<TranslationInterlinear>;
  customTranslation?: Array<{
    target: LanguageUnionType;
    codex: Codex<object, CodexBookVerse<{ text: string, metadata?: string[] }>>;
  }>;
}
