import { HolyScriptureModel } from './holy-scripture-model';
import { NewTestmentScriptures } from './new-testment-scriptures-model';
import { OldTestmentScriptures } from './old-testment-scriptures-model';
import { ScriptureBook } from './scripture-book-model';

export type AbstractHolyScriptureModel = {
  [book: string]: ScriptureBook
};
