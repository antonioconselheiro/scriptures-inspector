import { ScriptureVerseMetadata } from "./scripture-verse-metadata-model"

Array<Array<{
  verse: {
    index: number,
    start: `${number}`,
    end: `${number}`
  },
  metadata?: ScriptureVerseMetadata
}>>