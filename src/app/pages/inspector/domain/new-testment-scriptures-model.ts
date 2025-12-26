import { Codex } from '../../../domain/codex-model';
import { CodexBookChapterVerse } from '../../../domain/codex-book-chapter-verse-model';
import { NewTestamentBooksUnion } from '../../../domain/new-testament-books-union';

export type NewTestmentScriptures<Data extends object = {}> = Codex<NewTestamentBooksUnion, CodexBookChapterVerse<{ text: string } & Data>>;
