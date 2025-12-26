import { Language } from "./language-model"
import { TranslationInterlinearVerse } from "./translation-interlinear-verse-model"

export type TranslationInterlinear = {
  name: string;
  from: Language;
  to: Language;
  codex: {
    [book: string]: Array<Array<Array<TranslationInterlinearVerse>>>
  }
}
