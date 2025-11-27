import { ScriptureVerseMetadata } from "./scripture-verse-metadata-model"

export type ScriptureVerse = {
  verse: {
    index: number,
    start: `${number}`,
    end: `${number}`
  },
  metadata?: Array<ScriptureVerseMetadata>,
  text: string
}
