import { BookChapterVerseMetadata } from './book-chapter-verse-metadata-model';
import { BookMetadata } from './book-metadata-model';
import { BookVerse } from './book-verse-model';
import { CodexRecord } from './codex-record';
import { LanguageUnionType } from './language-union-type';
import { ProjectLanguage } from './project-language-model';
import { TranslationInterlinear } from './translation-interlinear-model';

export interface ProjectData {
  lang: ProjectLanguage;
  metadata: CodexRecord<BookMetadata, BookVerse<BookChapterVerseMetadata>>;
  interlinear?: Array<TranslationInterlinear>;
  customTranslation?: Array<{
    target: LanguageUnionType;
    codex: CodexRecord<object, BookVerse<{ text: string, metadata?: string[] }>>;
  }>;
}
