import { ScriptureVerseMetadataSegment } from './scripture-verse-metadata-word-segment-model';

export interface ScriptureVerseMetadataWord {
  segment: string;
  isWordOfGod?: boolean;
  kind: '' | 'godname' | 'keyword' | 'character' | 'amount';
}
