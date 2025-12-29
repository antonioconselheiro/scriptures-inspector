import { CodexBook } from './codex-book-model';
import { CodexBookVerse } from './codex-book-verse-model';

export type SourceBook<Data extends object = {}> = CodexBook<CodexBookVerse<{ text: string } & Data>>