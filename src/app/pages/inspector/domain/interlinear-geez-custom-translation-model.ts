import { NewBook } from "./new-book-enum";
import { OldBook } from "./old-book-enum";
import { TranslationInterlinearVerse } from "./translation-interlinear-verse-model";

export type InterlinearGeezCustomTranslation = {
  [newBook in OldBook]: Array<Array<Array<TranslationInterlinearVerse>>>
} & {
  [newBook in NewBook]: Array<Array<Array<TranslationInterlinearVerse>>>
}
