import { OldTestamentBooksUnion } from '../../../domain/old-testament-books-union';
import { TranslationInterlinearVerse } from './translation-interlinear-verse-model';

export type InterlinearGeezHebraic = {
  [oldBook in OldTestamentBooksUnion]: Array<Array<Array<TranslationInterlinearVerse>>>;
}
