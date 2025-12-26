import { NewTestamentBooksUnion } from "../../../domain/new-testament-books-union";
import { OldTestamentBooksUnion } from "../../../domain/old-testament-books-union";
import { TranslationInterlinearVerse } from "../../../domain/translation-interlinear-verse-model";

export type InterlinearGeezCustomTranslation = {
  [newBook in OldTestamentBooksUnion]: Array<Array<Array<TranslationInterlinearVerse>>>
} & {
  [newBook in NewTestamentBooksUnion]: Array<Array<Array<TranslationInterlinearVerse>>>
}
