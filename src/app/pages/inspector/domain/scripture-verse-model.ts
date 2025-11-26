export type ScriptureVerse = {
  verse: {
    index: number,
    start: `${number}`,
    end: `${number}`
  },
  metadata?: Array<{
    type: 'godsaid' | 'keyword' | 'quantitative',
    start: number,
    end: number
  }>,
  text: string
}
