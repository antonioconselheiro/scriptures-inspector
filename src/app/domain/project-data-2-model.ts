import { BookChapterVerseMetadata } from './book-chapter-verse-metadata-model';
import { BookMetadata } from './book-metadata-model';
import { Book } from './book-model';
import { BookVerse } from './book-verse-model';
import { KeyInterlinear } from './key-interlinear-type';
import { KeyMetadata } from './key-metadata-type';
import { KeyTranslation } from './key-translation-type';
import { TranslationInterlinearVerse } from './translation-interlinear-verse-model';

export type ProjectData2 = {
  [source: KeyMetadata]: Book<BookMetadata, BookVerse<BookChapterVerseMetadata>>,
  [source: KeyTranslation]: Book<object, BookVerse<{ text: string, metadata?: string[] }>>,
  [source: KeyInterlinear]: Book<BookMetadata, Array<TranslationInterlinearVerse>>,
  [source: string]: Book<object, object>
}
