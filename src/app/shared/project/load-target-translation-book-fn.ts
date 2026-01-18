import { BookTranslationTarget } from '@domain/book-translation-target-model';
import { KeyTranslation } from '@domain/key-translation-type';
import { loadTargetBookFn } from './load-target-book-fn';

export async function loadTargetTranslationBookFn(target: KeyTranslation, book: string): Promise<BookTranslationTarget> {
  const translation = await loadTargetBookFn(target, book);
  if (translation) {
    return translation;
  }

  return {
    chapters: []
  };
}
