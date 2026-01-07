export interface Codex {
  name: string;
  lang: string;
  data: {
    [book: string]: {
      name: string
    }
  };
}