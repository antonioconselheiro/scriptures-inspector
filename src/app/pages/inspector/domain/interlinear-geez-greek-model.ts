import { NewBook } from './new-testament-books-union';
import { TranslationInterlinearVerse } from './translation-interlinear-verse-model';

export type InterlinearGeezGreek = {
  [newBook in NewBook]: Array<Array<Array<TranslationInterlinearVerse>>>
}
