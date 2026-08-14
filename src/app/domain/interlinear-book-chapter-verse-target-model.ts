import { InterlinearBookChapterVerseWordTarget } from './interlinear-book-chapter-verse-word-target-model';

export interface InterlinearBookChapterVerseTarget {
  originChapter?: number;
  originVerse: number;
  chapter?: number;
  verse: number;
  words: Array<InterlinearBookChapterVerseWordTarget>;
}
