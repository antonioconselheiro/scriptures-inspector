import { AbstractCodice } from './abstract-codice-model';
import { AbstractScriptureVerse } from './abstract-scripture-verse-model';
import { NewTestamentBooksUnion } from './new-testament-books-union';

export type NewTestmentScriptures = AbstractCodice<NewTestamentBooksUnion, AbstractScriptureVerse<{ text: string }>>;
