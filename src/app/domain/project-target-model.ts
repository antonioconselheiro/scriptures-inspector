export interface ProjectTarget {
  language: Array<string>;
  books: {
    [language: string]: {
      [book: string]: {
        name: string;
      }
    }
  }
}
