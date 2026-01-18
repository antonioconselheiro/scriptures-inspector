import { BookInterlinear } from './book-interlinear-model';
import { BookMetadata } from './book-metadata-model';
import { Book } from './book-model';
import { BookTranslation } from './book-translation-model';
import { KeyInterlinear } from './key-interlinear-type';
import { KeyMetadata } from './key-metadata-type';
import { KeyTranslation } from './key-translation-type';

export type ProjectData2 = {
  [source: KeyMetadata]: BookMetadata,
  [source: KeyTranslation]: BookTranslation,
  [source: KeyInterlinear]: BookInterlinear,
  [source: string]: Book<object, object>
}
