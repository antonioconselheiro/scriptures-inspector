import { VerseNumberInterlinear } from './verse-number-interlinear-model';
import { VerseNumber } from './verse-number-model';

export type SourceVerse<VerseType extends VerseNumber | VerseNumberInterlinear = VerseNumber> = {
  verse: VerseType,
  text: string
}
