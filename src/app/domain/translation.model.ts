import { TranslationBook } from "./translation-book.model";

export interface Translation {
  key: string;
  name: string;
  ptName: string;
  content: Array<TranslationBook>
}
