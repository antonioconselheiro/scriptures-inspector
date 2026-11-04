import { BookTranslationTarget } from '@domain/book-translation-target-model';
import { BookMetadataTarget } from '@domain/book-metadata-target-model';
import { CurrentBook } from '@domain/current-book-model';
import { Language } from '@domain/language-model';
import { SourceBook } from '@domain/source-book-model';

export interface CodexConfigDialogData {
  bookMetadata: BookMetadataTarget;
  bookSource: SourceBook | null;
  language: Language | null;
  languageSource: string;
  currentBook: CurrentBook;
  translationBook: BookTranslationTarget | null;
}
