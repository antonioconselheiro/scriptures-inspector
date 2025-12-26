export interface ScriptureVerseMetadataWord {
  segment: string;
  isWordOfGod?: boolean;
  kind: '' | 'godname' | 'keyword' | 'character' | 'amount';
}
