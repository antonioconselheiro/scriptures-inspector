import { OldTestamentBooksUnion } from "./old-testament-books-union";
import { TranslationInterlinearVerse } from "./translation-interlinear-verse-model";

export type InterlinearHebraicCustomTranslation = {
  [oldBook in OldTestamentBooksUnion]: Array<Array<Array<TranslationInterlinearVerse>>>
}