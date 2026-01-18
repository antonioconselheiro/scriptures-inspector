import { Book } from './book-model';
import { BookMetadataAttributes } from './book-metadata-attributes-model';
import { TranslationInterlinearVerse } from './translation-interlinear-verse-model';

export type BookInterlinearTarget = Book<BookMetadataAttributes, Array<TranslationInterlinearVerse>>;
