import { NewBook } from "./new-testament-books-union";
import { OldBook } from "./old-testament-books-union";
import { TranslationInterlinearVerse } from "./translation-interlinear-verse-model";

export type InterlinearGeezCustomTranslation = {
  [newBook in OldBook]: Array<Array<Array<TranslationInterlinearVerse>>>
} & {
  [newBook in NewBook]: Array<Array<Array<TranslationInterlinearVerse>>>
}
