import { AbstractCodice } from "./abstract-codice-model";
import { AbstractScriptureVerse } from "./abstract-scripture-verse-model";
import { OldTestamentBooksUnion } from "../../../domain/old-testament-books-union";

export type OldTestmentScriptures<Data extends object = {}> = AbstractCodice<OldTestamentBooksUnion, AbstractScriptureVerse<{ text: string } & Data>>;
