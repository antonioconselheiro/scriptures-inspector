import { ScriptureVerseMetadataWord } from './scripture-verse-metadata-word-model';

export interface BookChapterVerseMetadata {
  metadata?: { [key: string]: ScriptureVerseMetadataWord };
}