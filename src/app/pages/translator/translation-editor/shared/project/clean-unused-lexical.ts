import { BookMetadataAttributes } from '@domain/book-metadata-attributes-model';
import { Language } from '@domain/language-model';
import { SourceBook } from '@domain/source-book-model';
import { ProjectDataService } from './project-data-service';
import { ProjectMetadataService } from './project-metadata-service';

export function cleanUnusedLexical(
  metadata: BookMetadataAttributes,
  source: SourceBook,
  language: Language,
  dataService: ProjectDataService,
  metadataService: ProjectMetadataService
): string[] {
  const normalize = language.normalizeFn ?? ((text: string) => text);
  const used = new Set<string>();
  for (const chapter of source.chapters) {
    for (const verse of chapter.verses) {
      const patterns = metadataService.parsePattern(metadata.patterns, language);
      for (const word of dataService.splitIntoMatrix(language, patterns, verse.text)) {
        for (const segment of word.segments) {
          used.add(normalize(segment.word));
        }
      }
    }
  }
  const removed = Object.keys(metadata.lexical).filter(key => !used.has(key));
  for (const key of removed) {
    delete metadata.lexical[key];
  }
  return removed;
}
