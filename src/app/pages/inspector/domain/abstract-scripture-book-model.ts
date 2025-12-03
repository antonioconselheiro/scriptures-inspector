import { AbstractScriptureVerse } from './abstract-scripture-verse-model';

export type AbstractScriptureBook<Verse extends AbstractScriptureVerse> = Array<Array<Verse>>;
