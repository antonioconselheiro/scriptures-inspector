import { BookInterlinearTarget } from './book-interlinear-target-model';
import { BookMetadataTarget } from './book-metadata-target-model';
import { Book } from './book-model';
import { BookTranslationTarget } from './book-translation-target-model';
import { KeyInterlinear } from './key-interlinear-type';
import { KeyMetadata } from './key-metadata-type';
import { KeyTranslation } from './key-translation-type';

export type ProjectData2 = {
  [source: KeyMetadata]: BookMetadataTarget,
  [source: KeyTranslation]: BookTranslationTarget,
  [source: KeyInterlinear]: BookInterlinearTarget,
  [source: string]: Book<object, object>
}
