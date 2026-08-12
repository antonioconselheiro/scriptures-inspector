export type BookInterlinearTarget = {
  [source: string]: {
    chapters: Array<{
      origin: number;
      chapter?: number;
      verses: Array<{
        originChapter?: number;
        originVerse: number;
        chapter?: number;
        verse: number;
      }>
    }>;
  }
};
