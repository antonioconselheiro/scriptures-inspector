import { CodexBookChapterVerse } from './codex-book-chapter-verse-model';

export type CodexBook<Book extends object = object, Verse extends CodexBookChapterVerse = CodexBookChapterVerse> = {
  chapters: Array<Array<Verse>>;
} & Book;
