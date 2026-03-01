import { BookInterlinearTarget } from '@domain/book-interlinear-target-model';
import { KeyInterlinear } from '@domain/key-interlinear-type';
import { loadTargetBookFn } from './load-target-book-fn';
import { Project } from '@domain/project-model';

export async function loadTargetInterlinearBookFn(project: Project, target: KeyInterlinear, book: string): Promise<BookInterlinearTarget> {
  const interlinear = await loadTargetBookFn(project, target, book);
  if (interlinear) {
    return interlinear;
  }

  return {
    chapters: [],
    patterns: {
      prefix: [],
      suffix: [],
      lexeme: []
    },
    lexical: {}
  };
}
