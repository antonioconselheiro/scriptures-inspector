import { OldBook } from './old-testament-books-union';
import { TranslationInterlinearVerse } from './translation-interlinear-verse-model';

export type InterlinearGeezHebraic = {
  [oldBook in OldBook]: Array<Array<Array<TranslationInterlinearVerse>>>;
}
