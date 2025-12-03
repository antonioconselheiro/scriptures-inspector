import { AbstractScriptureBook } from "./abstract-scripture-book-model";
import { AbstractScriptureVerse } from "./abstract-scripture-verse-model";

export type AbstractCodice<BookList extends string, Verse extends AbstractScriptureVerse> = {
  [key in BookList]: AbstractScriptureBook<Verse>
}
