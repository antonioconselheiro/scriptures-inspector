export interface Codex<LanguageType = string> {
  name: string;
  language: LanguageType;
  books?: {
    [book: string]: {
      name: string
    }
  };
  fragments?: {
    [fragment: string]: {
      name: string;
    }
  };
}
