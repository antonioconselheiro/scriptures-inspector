import { Codex } from '../../../domain/codex-model';
import { CodexBookVerse } from '../../../domain/codex-book-verse-model';
import { NewTestamentBooksUnion } from '../../../domain/new-testament-books-union';

export type NewTestmentScriptures<Data extends object = {}> = Codex<NewTestamentBooksUnion, CodexBookVerse<{ text: string } & Data>>;
