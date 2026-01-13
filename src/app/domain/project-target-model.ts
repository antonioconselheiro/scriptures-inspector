export interface ProjectTarget {
  language: string;
  books: {
    [book: string]: {
      name: string;
    }
  }
}
