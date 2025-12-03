import { AbstractCodice } from "./abstract-codice-model";
import { AbstractScriptureVerse } from "./abstract-scripture-verse-model";
import { OldTestamentBooksUnion } from "./old-testament-books-union";

export type OldTestmentScriptures = AbstractCodice<OldTestamentBooksUnion, AbstractScriptureVerse<{ text: string }>>;
