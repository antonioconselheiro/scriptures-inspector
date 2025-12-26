import { Codex } from './codex-model';
import { CodexBookChapterMetadata } from './codex-book-chapter-metadata-model';
import { CodexBookChapterVerseMetadata } from './codex-book-chapter-verse-metadata-model';
import { CodexBookChapterVerse } from './codex-book-chapter-verse-model';
import { TranslationInterlinear } from './translation-interlinear-model';
import { Language } from './language-model';

export interface ProjectData {
  lang: {
    from: Language;
    to: Language;
  };
  metadata: Codex<CodexBookChapterVerse<CodexBookChapterVerseMetadata>, CodexBookChapterMetadata>;
  interlinear?: TranslationInterlinear;
  customTranslation?: Codex<CodexBookChapterVerse<{ text: string, metadata?: string[] }>>;
}
