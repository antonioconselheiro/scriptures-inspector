import { Injectable } from '@angular/core';
import { Language } from '@domain/language-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { ParsedPatterns } from '@domain/parsed-patterns';
import { WordSegment } from '@domain/word-segment-model';
import { languageMetadataRecord } from '@shared/language-metadata/language-metadata-record';

@Injectable({
  providedIn: 'root'
})
export class ProjectDataService {

  castSegmentIntoMetadataIndex(
    language: LanguageUnionType,
    segment: WordSegment
  ): string {
    const word = languageMetadataRecord[language].normalizeFn && languageMetadataRecord[language].normalizeFn(segment.word) || segment.word;
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

  splitByPatterns(patterns: ParsedPatterns, pharse: string): string[] {
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
    data: { lexical: Record<string, string> },
    sourceLanguage: Language,
    word: string,
  ): string {
    const normalizeFn = sourceLanguage.normalizeFn ? sourceLanguage.normalizeFn : (word: string) => word;
    return data.lexical[normalizeFn(word)] || '';
  }
}
