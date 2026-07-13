export interface ProjectTarget {
  language: string;
  books?: {
    [book: string]: {
      name: string;
    }
  }
  collections?: {
    [collection: string]: {
      name: string;
      artifacts: Array<{
        name: string;
      }>
    }
  };
}
