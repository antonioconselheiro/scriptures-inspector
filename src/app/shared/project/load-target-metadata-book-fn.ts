import { BookMetadataTarget } from '@domain/book-metadata-target-model';
import { KeyMetadata } from '@domain/key-metadata-type';
import { Project } from '@domain/project-model';
import { loadTargetBookFn } from './load-target-book-fn';

export async function loadTargetMetadataBookFn(project: Project, target: KeyMetadata, book: string): Promise<BookMetadataTarget> {
  const metadata = await loadTargetBookFn(project, target, book);

  if (metadata) {
    return metadata;
  }

  return {
    chapters: [],
    patterns: {
      prefix: [],
      suffix: []
    },
    lexical: {}
  };
}
