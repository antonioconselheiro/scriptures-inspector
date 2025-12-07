import { NewTestamentBooksUnion } from "../../../domain/new-testament-books-union";
import { TranslationInterlinearVerse } from "./translation-interlinear-verse-model";

export type InterlinearGreekCustomTranslation = {
  [newBook in NewTestamentBooksUnion]: Array<Array<Array<TranslationInterlinearVerse>>>
}
