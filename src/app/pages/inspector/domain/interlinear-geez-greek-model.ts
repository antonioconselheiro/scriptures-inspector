import { NewBook } from './new-book-enum';
import { TranslationInterlinearVerse } from './translation-interlinear-verse-model';

export type InterlinearGeezGreek = {
  [newBook in NewBook]: Array<Array<Array<TranslationInterlinearVerse>>>
}
