import { Book } from './book-model';
import { BookVerse } from './book-verse-model';
import { BookMetadataAttributes } from './book-metadata-attributes-model';
import { BookChapterVerseMetadata } from './book-chapter-verse-metadata-model';

export type BookMetadataTarget = Book<BookMetadataAttributes, BookVerse<BookChapterVerseMetadata>>