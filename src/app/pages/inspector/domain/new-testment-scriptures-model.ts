import { AbstractCodice } from './abstract-codice-model';
import { AbstractScriptureVerse } from './abstract-scripture-verse-model';
import { NewTestamentBooksUnion } from '../../../domain/new-testament-books-union';

export type NewTestmentScriptures<Data extends object = {}> = AbstractCodice<NewTestamentBooksUnion, AbstractScriptureVerse<{ text: string } & Data>>;
