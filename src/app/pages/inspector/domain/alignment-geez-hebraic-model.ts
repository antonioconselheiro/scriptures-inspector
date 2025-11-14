import { OldBook } from './old-book-enum';
import { TranslationAlignmentVerse } from './translation-alignment-verse-model';

export type AlignmentGeezHebraic = {
  [oldBook in OldBook]: Array<Array<Array<TranslationAlignmentVerse>>>;
}
