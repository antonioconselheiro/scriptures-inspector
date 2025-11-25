export type ScriptureVerse = {
  verse: {
    index: number,
    start: `${number}`,
    end: `${number}`
  },
  metadata?: Array<{
    type: 'godsaid' | 'keyword' | 'measure',
    start: number,
    end: number
  }>,
  text: string
}
