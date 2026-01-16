import { BookChapterVerseMetadata } from './book-chapter-verse-metadata-model';
import { BookMetadata } from './book-metadata-model';
import { BookVerse } from './book-verse-model';
import { CodexRecord } from './codex-record';
import { ProjectLanguage } from './project-language-model';
import { TranslationInterlinear } from './translation-interlinear-model';

export interface ProjectData {
  language: ProjectLanguage;
  metadata: CodexRecord<BookMetadata, BookVerse<BookChapterVerseMetadata>>;
  interlineares?: {
    [source: string]: TranslationInterlinear
  };
  customTranslation?: CodexRecord<object, BookVerse<{ text: string, metadata?: string[] }>>;
}
