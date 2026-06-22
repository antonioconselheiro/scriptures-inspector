export interface ProjectTarget {
  language: string;
  fragments?: {
    [fragment: string]: {
      name: string;
    }
  };
  books?: {
    [book: string]: {
      name: string;
    }
  }
}
