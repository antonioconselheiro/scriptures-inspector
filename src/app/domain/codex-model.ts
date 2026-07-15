export interface Codex<LanguageType = string> {
  name: string;
  language: LanguageType;
  books?: {
    [book: string]: {
      name: string
    }
  };
}
