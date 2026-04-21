export interface ScriptureVerseMetadataWord {
  segment: string;
  keyword?: string;
  isWordOfGod?: boolean;
  kind: '' | 'godname' | 'keyword' | 'character' | 'amount';
}
