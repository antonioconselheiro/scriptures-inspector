import { CodexBook } from './codex-book-model';
import { CodexBookChapterVerse } from './codex-book-chapter-verse-model';

export type SourceBook<Data extends object = {}> = CodexBook<CodexBookChapterVerse<{ text: string } & Data>>