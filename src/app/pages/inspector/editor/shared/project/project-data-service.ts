import { Injectable } from '@angular/core';
import { LanguageUnionType } from '@domain/language-union-type';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { ParsedPatterns } from '@domain/parsed-patterns';
import { ProjectData2 } from '@domain/project-data-2-model';
import { ProjectStructureMetadataEditor } from '@domain/project-structure-metadata-editor-model';
import { WordSegment } from '@domain/word-segment-model';
import { languageMetadataRecord } from '@shared/language-metadata/language-metadata-record';

@Injectable({
  providedIn: 'root'
})
export class ProjectDataService {

  castSegmentIntoMetadataIndex(
    lang: LanguageUnionType,
    segment: WordSegment
  ): string {
    const word = languageMetadataRecord[lang].normalizeFn && languageMetadataRecord[lang].normalizeFn(segment.word) || segment.word;
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
    data: ProjectData2,
    editor: ProjectStructureMetadataEditor,
    word: string,
  ): string {
    return data[editor.target].lexical[word] || '';
  }
}
