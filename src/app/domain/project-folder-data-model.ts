import { AbstractCodice } from '../pages/inspector/domain/abstract-codice-model';
import { AbstractScriptureVerse } from '../pages/inspector/domain/abstract-scripture-verse-model';
import { ScriptureVerseMetadata } from '../pages/inspector/domain/scripture-verse-metadata-model';
import { TranslationInterlinearVerse } from '../pages/inspector/domain/translation-interlinear-verse-model';
import { PatternsSerialized } from '../pages/inspector/patterns-serialized';

export interface ProjectFolderData {
  metadata: AbstractCodice<AbstractScriptureVerse<ScriptureVerseMetadata>>;
  lexical: Record<string, string>;
  patterns: PatternsSerialized;
  customTranslation: AbstractCodice<AbstractScriptureVerse<{ text: string, metadata?: string[] }>>;
  interlinear: {
    [book: string]: Array<Array<Array<TranslationInterlinearVerse>>>
  }
}
