export type BookVerse<Data extends object = object> = {
  verse: number | {
    index: number,
    start: `${number}`,
    end: `${number}`
  };
} & Data;
