import { CurrentChapter } from '@domain/current-chapter-model';
import { InterlinearTarget } from '@domain/interlinear-target-model';
import { SourceVerse } from '@domain/source-verse-model';
import { Word } from '@domain/word-model';

export function getPresentationColor(index: number): string {
  return String(index % 7 + 1);
}

export function getSerializedSegmentIndex(value: string): number | null {
  const index = value.match(/^\d+/)?.[0];
  return index === undefined ? null : Number(index);
}

export function getCustomTranslationPresentationColor(
  serializedOrigin: string,
  interlinearOriginIndex?: number | null
): string {
  const originIndex = interlinearOriginIndex === undefined
    ? getSerializedSegmentIndex(serializedOrigin)
    : interlinearOriginIndex;
  return originIndex === null ? '' : getPresentationColor(originIndex);
}

export function getInterlinearOriginIndex(
  interlinearTarget: InterlinearTarget,
  originSource: string,
  current: CurrentChapter,
  verse: SourceVerse,
  wordIndex: number
): number | null {
  const chapter = interlinearTarget[originSource]?.chapters
    .find(item => item?.chapter === current.chapter);
  const mappedVerse = chapter?.verses?.find(item => item?.verse === verse.verse);
  return mappedVerse?.words?.[wordIndex]?.originIndex ?? null;
}

export function getInterlinearPresentationColor(
  interlinearTarget: InterlinearTarget,
  originSource: string,
  current: CurrentChapter,
  verse: SourceVerse,
  wordIndex: number
): string {
  const originIndex = getInterlinearOriginIndex(
    interlinearTarget,
    originSource,
    current,
    verse,
    wordIndex
  );
  return originIndex === null ? '' : getPresentationColor(originIndex);
}

export function isWordOfGod(
  metadata: Record<string, { isWordOfGod?: boolean }> | undefined,
  word: Word,
  getMetadataKey: (segment: Word['segments'][number]) => string
): boolean {
  return Boolean(metadata && word.segments.some(segment => metadata[getMetadataKey(segment)]?.isWordOfGod));
}
