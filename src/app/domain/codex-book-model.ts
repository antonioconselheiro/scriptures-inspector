import { CodexBookVerse } from './codex-book-verse-model';

export type CodexBook<Book extends object = object, Verse extends object = CodexBookVerse> = {
  chapters: Array<Array<Verse>>;
} & Book;
