import { TranslationInterlinearVerse } from "./translation-interlinear-verse-model";

export type TranslationInterlinear = {
  name: string;
  codex: {
    [book: string]: Array<Array<Array<TranslationInterlinearVerse>>>
  }
}
