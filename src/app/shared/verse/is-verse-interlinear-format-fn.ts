import { VerseNumberInterlinear } from '@domain/verse-number-interlinear-model';
import { VerseNumber } from '@domain/verse-number-model';

export function isVerseInterlinearFormatFn(value: VerseNumber): value is VerseNumberInterlinear {
  if (typeof value === 'number') {
    return false;
  }

  return true;
}