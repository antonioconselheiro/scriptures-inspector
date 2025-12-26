import { ScriptureVerseMetadataWord } from './scripture-verse-metadata-word-model';

export interface CodexBookChapterVerseMetadata {
  metadata?: { [key: string]: ScriptureVerseMetadataWord };
}