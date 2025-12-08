import { ScriptureVerseMetadataSegment } from './scripture-verse-metadata-word-segment-model';

export interface ScriptureVerseMetadataWord {
  word: string;
  isWordOfGod?: boolean;
  segments: Array<ScriptureVerseMetadataSegment | null>;
}
