import { SourceBook } from '@domain/source-book-model';

export type SourceCodex<Data extends object = {}> = {
  [book: string]: SourceBook<Data>
};
