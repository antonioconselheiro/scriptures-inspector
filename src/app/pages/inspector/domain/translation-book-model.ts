import { TranslationBookVerse } from './translation-book-verse-model';

export interface TranslationBook {
  testament: "old" | "new";
  key: string;
  chapter: number;
  content: Array<Array<TranslationBookVerse>>
}
