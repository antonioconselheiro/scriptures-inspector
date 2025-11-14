import { OldBook } from './old-book-enum';
import { ScriptureBook } from './scripture-book-model';

export type OldTestmentScriptures = {
  [oldBook in OldBook]: ScriptureBook
}
