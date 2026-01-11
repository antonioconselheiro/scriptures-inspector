import { BookChapterVerseMetadata } from './book-chapter-verse-metadata-model';
import { BookMetadata } from './book-metadata-model';
import { BookVerse } from './book-verse-model';
import { CodexRecord } from './codex-record';
import { ProjectLanguage } from './project-language-model';
import { TranslationInterlinear } from './translation-interlinear-model';

export interface ProjectData {
  lang: ProjectLanguage;
  metadata: CodexRecord<BookMetadata, BookVerse<BookChapterVerseMetadata>>;
  interlineares?: Array<TranslationInterlinear>;
  customTranslation?: Array<{
    target: string;
    codex: CodexRecord<object, BookVerse<{ text: string, metadata?: string[] }>>;
  }>;
}
