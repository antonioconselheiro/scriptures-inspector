import { BookTranslationTarget } from '@domain/book-translation-target-model';

export function removeTranslationVariation(book: BookTranslationTarget, id: string): void {
  delete book.variations[id];
  for (const chapter of book.chapters) {
    for (const verse of chapter?.verses ?? []) {
      if (verse?.variations) delete verse.variations[id];
    }
  }
}

export function selectVariationText(original: string, variations: Record<string, string>, selected: string[]): string {
  for (let index = selected.length - 1; index >= 0; index--) {
    const value = variations[selected[index]];
    if (value) return value;
  }
  return original;
}
