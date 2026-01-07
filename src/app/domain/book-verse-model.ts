export type BookVerse<Data extends object = object> = {
  verse: {
    index: number,
    start: `${number}`,
    end: `${number}`
  }
} & Data;
