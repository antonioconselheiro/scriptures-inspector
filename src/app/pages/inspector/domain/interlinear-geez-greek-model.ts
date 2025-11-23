import { NewBook } from './new-book-enum';
import { TranslationInterlinearVerse } from './translation-alignment-verse-model';

export type InterlinearGeezGreek = {
  [newBook in NewBook]: Array<Array<Array<TranslationInterlinearVerse>>>
}
