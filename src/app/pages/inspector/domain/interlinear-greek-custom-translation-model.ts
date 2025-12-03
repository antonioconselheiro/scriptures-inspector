import { NewBook } from "./new-testament-books-union";
import { TranslationInterlinearVerse } from "./translation-interlinear-verse-model";

export type InterlinearGreekCustomTranslation = {
  [newBook in NewBook]: Array<Array<Array<TranslationInterlinearVerse>>>
}
