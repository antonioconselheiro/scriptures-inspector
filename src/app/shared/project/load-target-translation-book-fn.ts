import { BookTranslationTarget } from '@domain/book-translation-target-model';
import { KeyTranslation } from '@domain/key-translation-type';
import { Project } from '@domain/project-model';
import { loadTargetBookFn } from './load-target-book-fn';

export async function loadTargetTranslationBookFn(project: Project, target: KeyTranslation, book: string): Promise<BookTranslationTarget> {
  const translation = await loadTargetBookFn(project, target, book);
  if (translation) {
    return translation;
  }

  return {
    chapters: []
  };
}
