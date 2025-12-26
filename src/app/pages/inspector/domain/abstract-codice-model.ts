import { AbstractScriptureBook } from "./abstract-scripture-book-model";
import { AbstractScriptureVerse } from "./abstract-scripture-verse-model";

export type AbstractCodice<Verse extends AbstractScriptureVerse = AbstractScriptureVerse> = {
  [bookKey: string]: AbstractScriptureBook<Verse>
}
