import { CodexBook } from '../../../domain/codex-book-model';
import { CodexBookChapterVerse } from '../../../domain/codex-book-chapter-verse-model';

export type AbstractHolyScriptureModel<Data extends object = {}> = {
  [book: string]: CodexBook<CodexBookChapterVerse<{ text: string } & Data>>
};
