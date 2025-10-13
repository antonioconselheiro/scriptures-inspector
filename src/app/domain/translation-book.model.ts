import { TranslationBookVerse } from "./translation-book-verse.model";

export interface TranslationBook {
  testament: "old" | "new";
  key: string;
  chapter:50;
  content: Array<Array<TranslationBookVerse>>
}
