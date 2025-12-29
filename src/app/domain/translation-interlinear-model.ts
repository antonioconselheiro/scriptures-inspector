import { CodexBookVerse } from './codex-book-verse-model';
import { Codex } from './codex-model';
import { ProjectLanguage } from './project-language-model';
import { TranslationInterlinearVerse } from './translation-interlinear-verse-model';

export interface TranslationInterlinear {
  name: string;
  lang?: ProjectLanguage;
  customTranslation?: Codex<object, CodexBookVerse<{ text: string, metadata?: string[] }>>;
  codex: Codex<object, Array<TranslationInterlinearVerse>>;
}
