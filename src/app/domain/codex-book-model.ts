import { CodexBookChapterVerse } from './codex-book-chapter-verse-model';

export type CodexBook<Verse extends CodexBookChapterVerse, Chapter extends object = object> = {
  verses: Array<Array<Verse>>;
} & Chapter;
