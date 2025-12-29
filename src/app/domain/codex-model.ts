import { CodexBook } from './codex-book-model';
import { CodexBookVerse } from './codex-book-verse-model';

export type Codex<Chapter extends object = object, Verse extends object = CodexBookVerse> = {
  [bookKey: string]: CodexBook<Chapter, Verse>
}
