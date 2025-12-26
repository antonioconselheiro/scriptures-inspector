import { AbstractCodice } from "./abstract-codice-model";
import { AbstractScriptureVerse } from "./abstract-scripture-verse-model";

export type OldTestmentScriptures<Data extends object = {}> = AbstractCodice<AbstractScriptureVerse<{ text: string } & Data>>;
