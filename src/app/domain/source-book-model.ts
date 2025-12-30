import { CodexBook } from './codex-book-model';
import { CodexBookVerse } from './codex-book-verse-model';

export type SourceBook = CodexBook<object, CodexBookVerse<{ text: string }>>