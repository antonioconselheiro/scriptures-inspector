import { OldTestamentBooksUnion } from "../../../domain/old-testament-books-union";
import { TranslationInterlinearVerse } from "../../../domain/translation-interlinear-verse-model";

export type InterlinearHebraicCustomTranslation = {
  [oldBook in OldTestamentBooksUnion]: Array<Array<Array<TranslationInterlinearVerse>>>
}