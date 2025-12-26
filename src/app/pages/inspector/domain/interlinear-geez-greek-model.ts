import { NewTestamentBooksUnion } from '@domain/new-testament-books-union';
import { TranslationInterlinearVerse } from '@domain/translation-interlinear-verse-model';

export type InterlinearGeezGreek = {
  [newBook in NewTestamentBooksUnion]: Array<Array<Array<TranslationInterlinearVerse>>>
}
