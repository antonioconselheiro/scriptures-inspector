import { NewTestamentBooksUnion } from "./new-testament-books-union";
import { OldTestamentBooksUnion } from "./old-testament-books-union";
import { TranslationInterlinearVerse } from "./translation-interlinear-verse-model";

export type InterlinearGeezCustomTranslation = {
  [newBook in OldTestamentBooksUnion]: Array<Array<Array<TranslationInterlinearVerse>>>
} & {
  [newBook in NewTestamentBooksUnion]: Array<Array<Array<TranslationInterlinearVerse>>>
}
