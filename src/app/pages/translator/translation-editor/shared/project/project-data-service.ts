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

  splitIntoMatrix(
    language: Language,
    patterns: ParsedPatterns,
    pharse: string
  ): Array<Word> {
    const normalizeFn = language.normalizeFn
      ? language.normalizeFn
      : (text: string) => text;

    type Segment = {
      word: string;
      morpheme: MorphemeType;
    };

    /**
     * Normaliza a palavra para matching, mas mantém o mapeamento
     * entre os índices normalizados e os índices da palavra original.
     *
     * Isso é necessário para idiomas como hebraico, onde:
     *
     *   מִינֵ֑
     *
     * vira:
     *
     *   מינה
     *
     * durante a comparação, mas precisamos retornar o texto original.
     */
    const createNormalizedWord = (word: string): {
      normalized: string;
      originalIndexes: number[];
    } => {
      const normalized = normalizeFn(word);

      if (normalized === word) {
        return {
          normalized,
          originalIndexes: Array.from(
            { length: normalized.length + 1 },
            (_, index) => index
          )
        };
      }

      const originalIndexes: number[] = [];

      for (
        let originalIndex = 0;
        originalIndex <= word.length;
        originalIndex++
      ) {
        const normalizedPrefix = normalizeFn(
          word.slice(0, originalIndex)
        );

        originalIndexes[normalizedPrefix.length] = originalIndex;
      }

      let lastIndex = 0;

      for (
        let normalizedIndex = 0;
        normalizedIndex <= normalized.length;
        normalizedIndex++
      ) {
        if (
          originalIndexes[normalizedIndex] !== undefined
        ) {
          lastIndex =
            originalIndexes[normalizedIndex];
        } else {
          originalIndexes[normalizedIndex] = lastIndex;
        }
      }

      return {
        normalized,
        originalIndexes
      };
    };

    /**
     * Procura um padrão no início, no final ou em qualquer posição
     * da palavra normalizada.
     *
     * O resultado usa os índices da palavra original.
     */
    const findPattern = (
      word: string,
      patternText: string,
      position: 'start' | 'end' | 'any'
    ): {
      word: string;
      index: number;
      endIndex: number;
    } | null => {
      if (!patternText) {
        return null;
      }

      const {
        normalized,
        originalIndexes
      } = createNormalizedWord(word);

      const normalizedPattern =
        normalizeFn(patternText);

      if (!normalizedPattern) {
        return null;
      }

      let normalizedIndex: number;

      switch (position) {
        case 'start':
          if (!normalized.startsWith(normalizedPattern)) {
            return null;
          }

          normalizedIndex = 0;
          break;

        case 'end':
          if (!normalized.endsWith(normalizedPattern)) {
            return null;
          }

          normalizedIndex =
            normalized.length -
            normalizedPattern.length;
          break;

        case 'any':
          normalizedIndex =
            normalized.indexOf(normalizedPattern);

          if (normalizedIndex === -1) {
            return null;
          }

          break;
      }

      const normalizedEndIndex =
        normalizedIndex +
        normalizedPattern.length;

      const originalStartIndex =
        originalIndexes[normalizedIndex];

      const originalEndIndex =
        originalIndexes[normalizedEndIndex];

      if (
        originalStartIndex === undefined ||
        originalEndIndex === undefined
      ) {
        return null;
      }

      return {
        word: word.slice(
          originalStartIndex,
          originalEndIndex
        ),
        index: originalStartIndex,
        endIndex: originalEndIndex
      };
    };

    /**
     * Procura e segmenta sufixos.
     *
     * isWordStart / isWordEnd representam a posição do trecho
     * em relação à PALAVRA ORIGINAL, e não ao trecho local.
     */
    function segmentSuffix(
      word: string,
      isWordStart: boolean,
      isWordEnd: boolean
    ): Segment[] {
      if (!word) {
        return [];
      }

      const suffixes = Array.from(patterns.suffix.entries())
        .sort(([a], [b]) => {
          const aNormalized = normalizeFn(a);
          const bNormalized = normalizeFn(b);

          return (
            bNormalized.length -
            aNormalized.length
          );
        });

      for (const [suffixPattern] of suffixes) {
        const match = findPattern(
          word,
          suffixPattern,
          'end'
        );

        if (!match) {
          continue;
        }

        const beforeSuffix = word.slice(
          0,
          match.index
        );

        /**
         * O suffix não pode ser o primeiro segmento
         * da palavra ORIGINAL.
         *
         * Se isWordStart === false, significa que já existe
         * algo antes deste trecho na palavra original.
         *
         * Exemplo:
         *
         *   root + "el"
         *
         * Ao processar "el":
         *
         *   isWordStart === false
         *   beforeSuffix === ""
         *
         * e isso é válido.
         */
        if (
          isWordStart &&
          !beforeSuffix
        ) {
          continue;
        }

        /**
         * Se existe algo antes do suffix, precisamos segmentá-lo.
         */
        if (beforeSuffix) {
          const beforeSegments = segmentWord(
            beforeSuffix,
            isWordStart,
            false
          );

          if (!beforeSegments.length) {
            continue;
          }

          /**
           * Garantia adicional:
           * o primeiro segmento da palavra original nunca
           * pode ser suffix.
           */
          if (
            isWordStart &&
            beforeSegments[0].morpheme === 'suffix'
          ) {
            continue;
          }

          return [
            ...beforeSegments,
            {
              word: match.word,
              morpheme: 'suffix'
            }
          ];
        }

        /**
         * Não existe nada antes localmente, mas como
         * isWordStart === false, este suffix já vem depois
         * de outro segmento.
         */
        return [
          {
            word: match.word,
            morpheme: 'suffix'
          }
        ];
      }

      return [
        {
          word,
          morpheme: 'root'
        }
      ];
    }

    /**
     * Segmenta recursivamente uma palavra.
     *
     * isWordStart:
     *   este trecho ainda está no início da palavra original?
     *
     * isWordEnd:
     *   este trecho ainda está no final da palavra original?
     */
    function segmentWord(
      word: string,
      isWordStart = true,
      isWordEnd = true
    ): Segment[] {
      if (!word) {
        return [];
      }

      /**
       * 1. A palavra inteira pode ser um lexema.
       */
      if (
        isWordStart &&
        isWordEnd
      ) {
        for (const [lexeme] of patterns.lexeme) {
          const match = findPattern(
            word,
            lexeme,
            'start'
          );

          if (
            match &&
            match.index === 0 &&
            match.endIndex === word.length
          ) {
            return [
              {
                word: match.word,
                morpheme: 'root'
              }
            ];
          }
        }
      }

      /**
       * 2. Procura o maior lexema interno.
       */
      let internalLexeme: {
        lexeme: string;
        word: string;
        index: number;
        endIndex: number;
      } | null = null;

      for (const [lexeme] of patterns.lexeme) {
        const match = findPattern(
          word,
          lexeme,
          'any'
        );

        if (!match) {
          continue;
        }

        const normalizedLexeme =
          normalizeFn(lexeme);

        const currentLength =
          internalLexeme
            ? normalizeFn(
              internalLexeme.lexeme
            ).length
            : 0;

        if (
          !internalLexeme ||
          normalizedLexeme.length > currentLength
        ) {
          internalLexeme = {
            lexeme,
            word: match.word,
            index: match.index,
            endIndex: match.endIndex
          };
        }
      }

      if (internalLexeme) {
        const beforeLexeme = word.slice(
          0,
          internalLexeme.index
        );

        const afterLexeme = word.slice(
          internalLexeme.endIndex
        );

        const root: Segment = {
          word: internalLexeme.word,
          morpheme: 'root'
        };

        return [
          ...segmentWord(
            beforeLexeme,
            isWordStart,
            false
          ),

          root,

          ...segmentSuffix(
            afterLexeme,
            false,
            isWordEnd
          )
        ].filter(Boolean);
      }

      /**
       * 3. Procura prefixos.
       *
       * Um prefixo é válido se:
       *
       *   - estiver no início do trecho;
       *   - deixar conteúdo depois dele OU houver conteúdo
       *     posteriormente na palavra original.
       *
       * Portanto "in" é válido em:
       *
       *   in + ablablivel
       *
       * mesmo quando estamos processando o trecho local "in".
       */
      for (const [prefixPattern] of patterns.prefix) {
        const match = findPattern(
          word,
          prefixPattern,
          'start'
        );

        if (!match) {
          continue;
        }

        const nextWord = word.slice(
          match.endIndex
        );

        /**
         * Só é inválido quando o prefixo termina
         * também a palavra ORIGINAL.
         *
         * Se isWordEnd === false, ainda existe conteúdo
         * posteriormente na palavra.
         */
        if (
          !nextWord &&
          isWordEnd
        ) {
          continue;
        }

        const prefix: Segment = {
          word: match.word,
          morpheme: 'prefix'
        };

        return [
          prefix,

          ...segmentWord(
            nextWord,
            false,
            isWordEnd
          )
        ].filter(Boolean);
      }

      /**
       * 4. Finalmente procura sufixos.
       */
      return segmentSuffix(
        word,
        isWordStart,
        isWordEnd
      );
    }

    let index = 0;

    const words = this.splitByLanguageWordSeparator(
      language,
      pharse
    );

    const wordMatrix = words
      .map(word => {
        const wordObject: Word = {
          segments: segmentWord(
            word.word
          ).map(segment => ({
            index: index++,
            morpheme: segment.morpheme,
            word: segment.word
          }))
        };

        if (word.separator !== undefined) {
          wordObject.separator =
            word.separator;
        }

        return wordObject;
      })
      .flat();

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
