import { OldBook } from "./old-book-enum";
import { TranslationInterlinearVerse } from "./translation-interlinear-verse-model";

export type InterlinearHebraicCustomTranslation = {
  [oldBook in OldBook]: Array<Array<Array<TranslationInterlinearVerse>>>
}