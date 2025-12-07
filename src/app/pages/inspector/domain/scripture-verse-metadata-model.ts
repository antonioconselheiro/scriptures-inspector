export interface ScriptureVerseMetadata {
  word: string;
  isWordOfGod?: boolean;
  metadata?: Array<{
    segment: string;
    kind: '' | 'godsaid' | 'godname' | 'keyword' | 'character' | 'amount'
  }>
}