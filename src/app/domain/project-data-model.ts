import { InterlinearTarget } from './interlinear-target-model';
import { BookMetadataTarget } from './book-metadata-target-model';
import { BookTranslationTarget } from './book-translation-target-model';
import { KeyInterlinear } from './key-interlinear-type';
import { KeyMetadata } from './key-metadata-type';
import { KeyTranslation } from './key-translation-type';

export type ProjectData = {
  [target: KeyMetadata]: BookMetadataTarget;
  [target: KeyTranslation]: BookTranslationTarget;
  [target: KeyInterlinear]: InterlinearTarget;
}
