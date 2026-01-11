export interface Codex<LanguageType = string> {
  name: string;
  lang: LanguageType;
  data: {
    [book: string]: {
      name: string
    }
  };
}
