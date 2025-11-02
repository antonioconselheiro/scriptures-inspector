import { NewBook } from './new-book-enum';
import { TranslationAlignmentVerse } from './translation-alignment-verse-model';

export type AlignmentGeezGreek = {
  [newBook in NewBook]: Array<Array<Array<TranslationAlignmentVerse>>>
}
