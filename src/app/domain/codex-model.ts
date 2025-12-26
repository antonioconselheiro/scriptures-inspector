import { CodexBook } from './codex-book-model';
import { CodexBookChapterVerse } from './codex-book-chapter-verse-model';

export type Codex<Verse extends CodexBookChapterVerse = CodexBookChapterVerse, Chapter extends object = object> = {
  [bookKey: string]: CodexBook<Verse, Chapter>
}
