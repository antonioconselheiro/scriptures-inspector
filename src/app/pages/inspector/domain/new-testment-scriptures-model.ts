import { CodexRecord } from '../../../domain/codex-record';
import { BookVerse } from '../../../domain/book-verse-model';
import { NewTestamentBooksUnion } from '../../../domain/new-testament-books-union';

export type NewTestmentScriptures<Data extends object = {}> = CodexRecord<NewTestamentBooksUnion, BookVerse<{ text: string } & Data>>;
