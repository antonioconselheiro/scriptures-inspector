import { BookInterlinearTarget } from '@domain/book-interlinear-target-model';
import { KeyInterlinear } from '@domain/key-interlinear-type';
import { loadTargetBookFn } from './load-target-book-fn';

export async function loadTargetInterlinearBookFn(target: KeyInterlinear, book: string): Promise<BookInterlinearTarget> {
  const interlinear = await loadTargetBookFn(target, book);
  if (interlinear) {
    return interlinear;
  }

  return {
    chapters: [],
    patterns: {
      prefix: [],
      suffix: []
    },
    lexical: {}
  };
}
