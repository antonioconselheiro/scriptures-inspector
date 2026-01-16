export interface Codex<LanguageType = string> {
  name: string;
  language: LanguageType;
  data: {
    [book: string]: {
      name: string
    }
  };
}
