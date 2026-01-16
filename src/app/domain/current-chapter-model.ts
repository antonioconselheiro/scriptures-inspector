import { CurrentBook } from './current-book-model';

export interface CurrentChapter extends CurrentBook {
  chapter: number;
}
