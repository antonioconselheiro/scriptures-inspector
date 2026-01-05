export interface ProjectFileCodex {
  name: string;
  lang: string;
  data: {
    [book: string]: {
      name: string
    }
  };
}