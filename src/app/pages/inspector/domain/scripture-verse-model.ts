export type ScriptureVerse = {
  verse: {
    index: number,
    start: `${number}`,
    end: `${number}`
  },
  metadata?: {
    sacred?: Array<{
      index: number,
      type: 'wordOfGod' | 'GodName'
    }>
  },
  text: string
}
