import { BookTranslationTarget } from '@domain/book-translation-target-model';

export type VariationCompositionMode = 'overwrite' | 'merge';
export interface VariationSelection {
  id: string;
  mode: VariationCompositionMode;
}

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

export function composeVariationText(
  original: string,
  variations: Record<string, string>,
  selected: string[],
  mode: VariationCompositionMode = 'overwrite'
): string {
  if (mode === 'overwrite') {
    return selectVariationText(original, variations, selected);
  }

  const alternatives = selected
    .map(id => variations[id])
    .filter((value): value is string => Boolean(value));
  if (!alternatives.length) {
    return original;
  }
  const base = original ? `${original} ` : '';
  return `${base}(${alternatives.join('; ')})`;
}

export function composeMixedVariationText(
  original: string,
  variations: Record<string, string>,
  selected: VariationSelection[]
): string {
  const overwritten = composeVariationText(
    original, variations, selected.filter(item => item.mode === 'overwrite').map(item => item.id)
  );
  return composeVariationText(
    overwritten, variations, selected.filter(item => item.mode === 'merge').map(item => item.id), 'merge'
  );
}
