import { AbstractScriptureBook } from './abstract-scripture-book-model';
import { AbstractScriptureVerse } from './abstract-scripture-verse-model';

export type AbstractHolyScriptureModel = {
  [book: string]: AbstractScriptureBook<AbstractScriptureVerse<{ text: string }>>
};
