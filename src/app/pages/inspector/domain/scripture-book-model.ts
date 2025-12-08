import { AbstractScriptureBook } from "./abstract-scripture-book-model";
import { AbstractScriptureVerse } from "./abstract-scripture-verse-model";

export type ScriptureBook<Data extends object = {}> = AbstractScriptureBook<AbstractScriptureVerse<{ text: string } & Data>>