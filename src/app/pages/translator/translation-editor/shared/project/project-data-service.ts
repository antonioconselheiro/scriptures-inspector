import { Injectable } from '@angular/core';
import { BookMetadataAttributesLexicalModel } from '@domain/book-metadata-attributes-lexical-model';
import { InterlinearBookChapterVerseWordTarget } from '@domain/interlinear-book-chapter-verse-word-target-model';
import { Language } from '@domain/language-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { ParsedPatterns } from '@domain/parsed-patterns';
import { Word } from '@domain/word-model';
import { WordSegment } from '@domain/word-segment-model';
import { languageMetadataRecord } from '@shared/language-metadata/language-metadata-record';

@Injectable({
  providedIn: 'root'
})
export class ProjectDataService {

  castSegmentIntoMetadataIndexSerialized(
    language: LanguageUnionType,
    segment: WordSegment
  ): string {
    const word = languageMetadataRecord[language].normalizeFn && languageMetadataRecord[language].normalizeFn(segment.word) || segment.word;
    return `${segment.index}-${word}`;
  }

  castInterlinearWordTargetIntoMetadataIndexSerialized(
    language: LanguageUnionType,
    interlinearMetadata: InterlinearBookChapterVerseWordTarget
  ): string {
    const word = languageMetadataRecord[language].normalizeFn && languageMetadataRecord[language].normalizeFn(interlinearMetadata.originWord) || interlinearMetadata.originWord;
    return `${interlinearMetadata.originIndex}-${word}`;
  }

  splitIntoMatrix(language: Language, patterns: ParsedPatterns, pharse: string): Array<Word> {
    const segmentWord = (word: string): string[] => {
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
          ...segmentWord(beforeLexeme),
          internalLexeme.lexeme,
          ...segmentWord(afterLexeme)
        ];
      }

      for (let [, pattern] of patterns.prefix) {
        const match = word.match(pattern);
        if (match) {
          const [prefix] = Array.from(match);
          const nextWord = word.replace(pattern, '');
          return [prefix, ...segmentWord(nextWord)].filter(eachWord => eachWord);
        }
      }

      for (let [, pattern] of patterns.suffix) {
        const match = word.match(pattern);
        if (match) {
          const [suffix] = Array.from(match);
          const nextWord = word.replace(pattern, '');
          return [...segmentWord(nextWord), suffix].filter(eachWord => eachWord);
        }
      }

      return [word];
    };

    let index = 0;
    const words = this.splitByLanguageWordSeparator(language, pharse);
      return words.map(word => {
        const wordObject: Word = {
          segments: segmentWord(word.word).map(word => {
            return {
              index: index++,
              word
            };
          })
        };

        if (word.separator !== undefined) {
          wordObject.separator = word.separator;
        }

        return wordObject;
      }).flat();
  }

  splitByLanguageWordSeparator(language: Language, text: string): Array<{ word: string; separator?: string; }> {
    const splittingChars = language.wordSeparator || [' '];
    const regex = new RegExp(`([${splittingChars.join('')}]+)`, 'g');
    const parts = text.split(regex);

    const result: Array<{ word: string; separator?: string; }> = [];

    for (let i = 0; i < parts.length; i += 2) {
      const word = parts[i];
      const separator = parts[i + 1];

      if (word.length === 0) {
        continue;
      }

      result.push({
        word: word,
        ...(separator ? { separator } : {}),
      });
    }

    return result;
  }

  getLexical(
    data: { lexical: Record<string, BookMetadataAttributesLexicalModel> },
    sourceLanguage: Language,
    word: string,
    isLastSegment: boolean
  ): string {
    const normalizeFn = sourceLanguage.normalizeFn ? sourceLanguage.normalizeFn : (word: string) => word;
    const lexicalValues = data.lexical[normalizeFn(word)];

    if (lexicalValues) {
      if (isLastSegment && lexicalValues.suffix) {
        return lexicalValues.suffix;
      }
      
      return lexicalValues.value || '';
    }

    return '';
  }
}
