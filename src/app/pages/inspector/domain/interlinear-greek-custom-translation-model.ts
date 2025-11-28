import { NewBook } from "./new-book-enum";
import { TranslationInterlinearVerse } from "./translation-interlinear-verse-model";

export type InterlinearGreekCustomTranslation = {
  [newBook in NewBook]: Array<Array<Array<TranslationInterlinearVerse>>>
}
