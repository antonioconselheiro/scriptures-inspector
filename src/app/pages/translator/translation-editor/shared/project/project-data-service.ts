import { Injectable } from '@angular/core';
import { BookMetadataAttributesLexicalModel } from '@domain/book-metadata-attributes-lexical-model';
import { InterlinearBookChapterVerseWordTarget } from '@domain/interlinear-book-chapter-verse-word-target-model';
import { Language } from '@domain/language-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { MorphemeType } from '@domain/morpheme-type';
import { ParsedPatterns } from '@domain/parsed-patterns-model';
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
    const prefetchMatcherFn = language.prefetchMatcherFn
      ? language.prefetchMatcherFn
      : (text: string) => text;

    const segmentSuffix = (word: string): Array<{
      word: string;
      morpheme: MorphemeType;
    }> => {
      if (!word) {
        return [];
      }

      const suffixes = Array.from(patterns.suffix.entries())
        .sort(([a], [b]) => {
          const aNormalized = prefetchMatcherFn(a);
          const bNormalized = prefetchMatcherFn(b);

          return bNormalized.length - aNormalized.length;
        });

      for (const [, pattern] of suffixes) {
        const match = pattern.exec(word);

        if (!match || match.index === undefined) {
          continue;
        }

        const suffix = match[0];

        if (!suffix) {
          continue;
        }

        const beforeSuffix = word.slice(0, match.index);
        const segmentSuffix: { word: string; morpheme: MorphemeType } = {
          word: suffix,
          morpheme: 'suffix'
        };

        return [
          ...segmentWord(beforeSuffix),
          segmentSuffix
        ].filter(Boolean);
      }

      return [{ word, morpheme: 'root' }];
    };

    const segmentWord = (word: string): Array<{ word: string; morpheme: MorphemeType }> => {
      if (!word) {
        return [];
      }

      // 1. A palavra inteira pode ser um lexema.
      for (const [, pattern] of patterns.lexeme) {
        const match = pattern.exec(word);

        if (match) {
          const lexeme = match[0];

          if (lexeme) {
            return [{ word: lexeme, morpheme: 'root' }];
          }
        }
      }

      // 2. Procura o maior lexema dentro da palavra.
      let internalLexeme: {
        lexeme: string;
        index: number;
        matched: string;
      } | null = null;

      for (const [lexeme] of patterns.lexeme) {
        if (!lexeme) {
          continue;
        }

        const matcher = new RegExp(
          prefetchMatcherFn(lexeme),
          'u'
        );

        const match = matcher.exec(word);

        if (!match || match.index === undefined) {
          continue;
        }

        if (
          !internalLexeme ||
          lexeme.length > internalLexeme.lexeme.length
        ) {
          internalLexeme = {
            lexeme,
            index: match.index,
            matched: match[0]
          };
        }
      }

      if (internalLexeme) {
        const beforeLexeme = word.slice(
          0,
          internalLexeme.index
        );

        const afterLexeme = word.slice(
          internalLexeme.index + internalLexeme.matched.length
        );

        const segmentRoot: { word: string; morpheme: MorphemeType } = {
          word: internalLexeme.matched,
          morpheme: 'root'
        };

        return [
          ...segmentWord(beforeLexeme),
          segmentRoot,
          ...segmentSuffix(afterLexeme)
        ].filter(Boolean);
      }

      // 3. Só procura prefixo quando não existe lexema.
      for (const [, pattern] of patterns.prefix) {
        const match = pattern.exec(word);
        if (!match) {
          continue;
        }

        const prefix = match[0];
        if (!prefix) {
          continue;
        }

        const nextWord = word.slice(prefix.length);
        const segmentPrefix: { word: string; morpheme: MorphemeType } = { word: prefix, morpheme: 'prefix' };

        return [
          segmentPrefix,
          ...segmentWord(nextWord)
        ].filter(Boolean);
      }

      // 4. Finalmente, procura o sufixo do maior para o menor.
      return segmentSuffix(word);
    };

    let index = 0;
    const words = this.splitByLanguageWordSeparator(language, pharse);
    const wordMatrix = words.map(word => {
      const wordObject: Word = {
        segments: segmentWord(word.word).map(segment => {
          return {
            index: index++,
            morpheme: segment.morpheme,
            word: segment.word
          };
        })
      };

      if (word.separator !== undefined) {
        wordObject.separator = word.separator;
      }

      return wordObject;
    }).flat();

    return wordMatrix;
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
    morpheme: MorphemeType
  ): { config: MorphemeType, value: string } {
    const normalizeFn = sourceLanguage.normalizeFn ? sourceLanguage.normalizeFn : (word: string) => word;
    const lexicalValues = data.lexical[normalizeFn(word)];

    if (lexicalValues) {
      if (morpheme === 'suffix' && 'suffix' in lexicalValues) {
        return { config: 'suffix', value: lexicalValues.suffix || '' };
      } else if (morpheme === 'prefix' && 'prefix' in lexicalValues) {
        return { config: 'prefix', value: lexicalValues.prefix || '' };
      }

      return { config: 'root', value: lexicalValues.value || '' };
    }

    return { config: 'root', value: '' };
  }
}
