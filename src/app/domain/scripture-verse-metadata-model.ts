import { ScriptureVerseMetadataWord } from './scripture-verse-metadata-word-model';

export interface ScriptureVerseMetadata {
  metadata?: { [key: string]: ScriptureVerseMetadataWord };
}