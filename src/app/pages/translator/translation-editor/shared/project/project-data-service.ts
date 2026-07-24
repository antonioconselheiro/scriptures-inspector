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
    language: Language,
    parsedBook: ParsedBookMetadata,
    text: string
  ): Array<Array<{ index: number, word: string }>> {
    let index = 0;
    const splittingChars = [ ' ', ...(language.wordSeparator || []) ];
    const wordSplitterPattern = new RegExp(`[${splittingChars.join('')}]`, 'g'); 
    return text.split(wordSplitterPattern).map(word => this.splitByPatterns(parsedBook.patterns, word).map(word => {
      return { index: index++, word };
    }));
  }

  splitByPatterns(patterns: ParsedPatterns, pharse: string): string[] {
    const splitWord = (word: string): string[] => {
      if (!word) {
        return [];
      }

      for (let [, pattern] of patterns.lexeme) {
        const match = word.match(pattern);
        if (match) {
          const [lexeme] = Array.from(match);
          if (lexeme) {
            return [lexeme];
          }
        }
      }

      let internalLexeme: { lexeme: string; index: number } | null = null;
      for (let [lexeme] of patterns.lexeme) {
        if (!lexeme) {
          continue;
        }

        const index = word.indexOf(lexeme);
        if (index < 0) {
          continue;
        }

        if (!internalLexeme || lexeme.length > internalLexeme.lexeme.length) {
          internalLexeme = { lexeme, index };
        }
      }

      if (internalLexeme) {
        const beforeLexeme = word.slice(0, internalLexeme.index);
        const afterLexeme = word.slice(internalLexeme.index + internalLexeme.lexeme.length);
        return [
          ...splitWord(beforeLexeme),
          internalLexeme.lexeme,
          ...splitWord(afterLexeme)
        ];
      }

      for (let [, pattern] of patterns.prefix) {
        const match = word.match(pattern);
        if (match) {
          const [prefix] = Array.from(match);
          const nextWord = word.replace(pattern, '');
          return [prefix, ...splitWord(nextWord)].filter(eachWord => eachWord);
        }
      }

      for (let [, pattern] of patterns.suffix) {
        const match = word.match(pattern);
        if (match) {
          const [suffix] = Array.from(match);
          const nextWord = word.replace(pattern, '');
          return [...splitWord(nextWord), suffix].filter(eachWord => eachWord);
        }
      }

      return [word];
    };

    return pharse.split(' ').map(word => splitWord(word)).flat();
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
