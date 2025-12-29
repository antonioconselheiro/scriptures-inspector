import { Injectable } from '@angular/core';
import { Language } from '@domain/language-model';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { ParsedPatterns } from '@domain/parsed-patterns';
import { ProjectData } from '@domain/project-data-model';
import { WordSegment } from '@domain/word-segment-model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  castSegmentIntoMetadataIndex(
    lang: Language,
    segment: WordSegment
  ): string {
    const word = lang.normalizeFn && lang.normalizeFn(segment.word) || segment.word;
    return `${segment.index}-${word}`;
  }

  splitIntoMatrix(
    parsedBook: ParsedBookMetadata,
    text: string
  ): Array<Array<{ index: number, word: string }>> {
    let index = 0;
    return text.split(' ').map(word => this.splitByPatterns(parsedBook.patterns, word).map(word => {
      return { index: index++, word };
    }));
  }

  private splitByPatterns(patterns: ParsedPatterns, pharse: string): string[] {
    return pharse.split(' ').map(word => {
      let matchPrefix = '',
        matchSuffix = '';

      for (let [, pattern] of patterns.prefix) {
        const match = word.match(pattern);
        if (match) {
          const [prefix] = Array.from(match);
          matchPrefix = prefix;
          word = word.replace(pattern, '');
          break;
        }
      }

      for (let [, pattern] of patterns.suffix) {
        const match = word.match(pattern);
        if (match) {
          const [suffix] = Array.from(match);
          matchSuffix = suffix;
          word = word.replace(pattern, '');
          break;
        }
      }

      let words: string[] = [];
      if (matchPrefix && matchSuffix) {
        words = [matchPrefix, ...this.splitByPatterns(patterns, word), matchSuffix];
      } else if (matchPrefix) {
        words = [matchPrefix, ...this.splitByPatterns(patterns, word)];
      } else if (matchSuffix) {
        words = [...this.splitByPatterns(patterns, word), matchSuffix];
      } else {
        words = [word];
      }

      return words.filter(word => word);
    }).flat();
  }

  getLexical(
    project: ProjectData,
    book: string,
    word: string,
  ): string {
    return project.metadata[book].lexical[word] || '';
  }
}
