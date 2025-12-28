import { CodexBook } from './codex-book-model';
import { CodexBookChapterVerse } from './codex-book-chapter-verse-model';

export type Codex<Chapter extends object = object, Verse extends CodexBookChapterVerse = CodexBookChapterVerse> = {
  [bookKey: string]: CodexBook<Chapter, Verse>
}
