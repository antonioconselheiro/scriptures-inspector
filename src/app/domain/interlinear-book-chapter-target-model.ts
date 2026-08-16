import { InterlinearBookChapterVerseTarget } from './interlinear-book-chapter-verse-target-model';

export interface InterlinearBookChapterTarget {
  origin: number;
  chapter: number;
  verses: Array<InterlinearBookChapterVerseTarget>;
}
