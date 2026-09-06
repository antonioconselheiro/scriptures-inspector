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
      start: number;
      end: number;
    };

    type Match = {
      pattern: string;
      start: number;
      end: number;
    };

    /**
     * Normaliza o texto, mas preserva a correspondência entre
     * posições do texto normalizado e posições do texto original.
     *
     * A posição representa uma fronteira:
     *
     * normalizedIndex -> originalIndex
     *
     * Exemplo conceitual:
     *
     *   original:   לְ מִ י נֵ ֑ ה וּ
     *   normalized: ל  מ י נ ה    ה ו
     *
     * Mesmo que o normalizeFn remova niqqud, conseguimos
     * voltar para a posição correta do texto original.
     */
    const createNormalizedWord = (
      word: string
    ): {
      normalized: string;
      originalIndexes: number[];
    } => {
      const segmenter = new Intl.Segmenter(
        undefined,
        {
          granularity: 'grapheme'
        }
      );

      const graphemes = Array.from(
        segmenter.segment(word)
      );

      /**
       * Normalize the complete word exactly as normalizeFn
       * expects to receive it.
       *
       * We only use the grapheme boundaries to determine where
       * each normalized boundary belongs in the original string.
       */
      const normalized = normalizeFn(word);

      const originalIndexes =
        new Array<number>(normalized.length + 1);

      /**
       * For every grapheme boundary in the original word,
       * normalize the prefix ending at that boundary.
       *
       * The length of that normalized prefix gives us the
       * corresponding boundary in the normalized string.
       *
       * Example:
       *
       * original:
       *   לְ | מִ | נֵ֑ | ה | וּ
       *
       * normalized:
       *   ל  | מ  | נ  | ה | ו
       *
       * boundary:
       *
       * normalized 0 -> original 0
       * normalized 1 -> original 2
       * normalized 2 -> original 4
       * normalized 3 -> original 6
       * normalized 4 -> original 7
       * normalized 5 -> original 9
       */
      originalIndexes[0] = 0;

      for (const grapheme of graphemes) {
        const originalBoundary =
          grapheme.index +
          grapheme.segment.length;

        const normalizedBoundary =
          normalizeFn(
            word.slice(0, originalBoundary)
          ).length;

        originalIndexes[
          normalizedBoundary
        ] = originalBoundary;
      }

      /**
       * Fill any gaps.
       *
       * Normally matches should begin/end on grapheme
       * boundaries. This also makes the mapping safe when
       * normalizeFn produces multiple characters.
       */
      let lastOriginalIndex = 0;

      for (
        let normalizedIndex = 0;
        normalizedIndex <= normalized.length;
        normalizedIndex++
      ) {
        if (
          originalIndexes[normalizedIndex] !== undefined
        ) {
          lastOriginalIndex =
            originalIndexes[normalizedIndex];
        } else {
          originalIndexes[normalizedIndex] =
            lastOriginalIndex;
        }
      }

      return {
        normalized,
        originalIndexes
      };
    };

    const findAll = (
      word: string,
      pattern: string
    ): Match[] => {
      if (!pattern) {
        return [];
      }

      const {
        normalized,
        originalIndexes
      } = createNormalizedWord(word);

      /**
       * IMPORTANT:
       *
       * Normalize the pattern as a complete string as well.
       *
       * This keeps word and pattern normalization symmetric.
       */
      const normalizedPattern =
        normalizeFn(pattern);

      if (!normalizedPattern) {
        return [];
      }

      const matches: Match[] = [];

      let fromIndex = 0;

      while (
        fromIndex <= normalized.length
      ) {
        const normalizedStart =
          normalized.indexOf(
            normalizedPattern,
            fromIndex
          );

        if (normalizedStart === -1) {
          break;
        }

        const normalizedEnd =
          normalizedStart +
          normalizedPattern.length;

        const start =
          originalIndexes[normalizedStart];

        const end =
          originalIndexes[normalizedEnd];

        /**
         * A valid morphological match must begin and end
         * on boundaries that can be mapped back to the
         * original word.
         */
        if (
          start !== undefined &&
          end !== undefined &&
          end > start
        ) {
          matches.push({
            pattern,
            start,
            end
          });
        }

        /**
         * Prevent infinite loops and allow the next match.
         */
        fromIndex =
          normalizedStart +
          Math.max(
            normalizedPattern.length,
            1
          );
      }

      return matches;
    };

    const getLength = (match: Match): number =>
      match.end - match.start;

    const findPrefixesAt = (
      word: string,
      position: number
    ): Match[] => {
      const result: Match[] = [];

      for (const [pattern] of patterns.prefix) {
        for (const match of findAll(word, pattern)) {
          if (match.start === position) {
            result.push(match);
          }
        }
      }

      return result.sort(
        (a, b) =>
          getLength(b) - getLength(a)
      );
    };

    const findSuffixesAt = (
      word: string,
      position: number
    ): Match[] => {
      const result: Match[] = [];

      for (const [pattern] of patterns.suffix) {
        for (const match of findAll(word, pattern)) {
          if (match.start === position) {
            result.push(match);
          }
        }
      }

      return result.sort(
        (a, b) =>
          getLength(b) - getLength(a)
      );
    };

    const findLexemes = (
      word: string
    ): Match[] => {
      const result: Match[] = [];

      for (const [pattern] of patterns.lexeme) {
        for (const match of findAll(word, pattern)) {
          result.push(match);
        }
      }

      /**
       * Maior lexema primeiro.
       *
       * Em empate, menor posição primeiro.
       */
      return result.sort(
        (a, b) =>
          getLength(b) - getLength(a) ||
          a.start - b.start
      );
    };

    /**
     * prefix*
     *
     * Nunca permite:
     *
     * prefix depois do root
     * prefix consumindo o root
     * prefix sozinho no final
     */
    const segmentPrefixes = (
      word: string,
      position: number,
      rootStart: number
    ): Segment[] | null => {
      if (position === rootStart) {
        return [];
      }

      if (position > rootStart) {
        return null;
      }

      const candidates =
        findPrefixesAt(word, position)
          .filter(
            match =>
              match.end <= rootStart
          );

      for (const match of candidates) {
        /**
         * Um prefix não pode ser a última coisa
         * da palavra quando não existe root depois.
         */
        if (
          match.end === word.length &&
          match.end !== rootStart
        ) {
          continue;
        }

        const rest =
          segmentPrefixes(
            word,
            match.end,
            rootStart
          );

        if (rest !== null) {
          return [
            {
              word: word.slice(
                match.start,
                match.end
              ),
              morpheme: 'prefix',
              start: match.start,
              end: match.end
            },
            ...rest
          ];
        }
      }

      return null;
    };

    /**
     * suffix*
     *
     * Essa função só é chamada DEPOIS do root.
     */
    const segmentSuffixes = (
      word: string,
      position: number
    ): Segment[] | null => {
      if (position === word.length) {
        return [];
      }

      const candidates =
        findSuffixesAt(
          word,
          position
        );

      for (const match of candidates) {
        const rest =
          segmentSuffixes(
            word,
            match.end
          );

        if (rest !== null) {
          return [
            {
              word: word.slice(
                match.start,
                match.end
              ),
              morpheme: 'suffix',
              start: match.start,
              end: match.end
            },
            ...rest
          ];
        }
      }

      return null;
    };

    const buildAroundLexeme = (
      word: string,
      lexeme: Match
    ): Segment[] | null => {
      const prefixSegments =
        segmentPrefixes(
          word,
          0,
          lexeme.start
        );

      if (
        lexeme.start > 0 &&
        prefixSegments === null
      ) {
        return null;
      }

      const suffixSegments =
        segmentSuffixes(
          word,
          lexeme.end
        );

      if (
        lexeme.end < word.length &&
        suffixSegments === null
      ) {
        return null;
      }

      return [
        ...(prefixSegments || []),

        {
          word: word.slice(
            lexeme.start,
            lexeme.end
          ),
          morpheme: 'root',
          start: lexeme.start,
          end: lexeme.end
        },

        ...(suffixSegments || [])
      ];
    };

    /**
     * IMPORTANTE:
     *
     * Não usamos mais suffix-only como solução geral.
     *
     * Uma palavra que começa com suffix não deve ser
     * automaticamente transformada numa sequência de suffixes.
     */
    const buildWithoutLexeme = (
      word: string
    ): Segment[] | null => {
      if (!word) {
        return null;
      }

      type PrefixPath = {
        end: number;
        segments: Segment[];
      };

      type SuffixPath = {
        start: number;
        segments: Segment[];
      };

      /**
       * Retorna todas as possíveis cadeias de prefixos
       * começando obrigatoriamente em `position`.
       *
       * O prefixo nunca pode consumir a palavra inteira.
       */
      const findPrefixPaths = (
        position: number
      ): PrefixPath[] => {
        const paths: PrefixPath[] = [
          {
            end: position,
            segments: []
          }
        ];

        const candidates =
          findPrefixesAt(word, position);

        for (const match of candidates) {
          /**
           * Um prefixo sozinho não pode terminar a palavra.
           */
          if (match.end === word.length) {
            continue;
          }

          const rest =
            findPrefixPaths(match.end);

          for (const path of rest) {
            paths.push({
              end: path.end,
              segments: [
                {
                  word: word.slice(
                    match.start,
                    match.end
                  ),
                  morpheme: 'prefix',
                  start: match.start,
                  end: match.end
                },
                ...path.segments
              ]
            });
          }
        }

        return paths;
      };

      /**
       * Procura uma cadeia de suffixes que começa em
       * `position` e obrigatoriamente termina no fim da palavra.
       */
      const findSuffixPaths = (
        position: number
      ): SuffixPath[] => {
        if (position === word.length) {
          return [
            {
              start: position,
              segments: []
            }
          ];
        }

        const paths: SuffixPath[] = [];

        const candidates =
          findSuffixesAt(word, position);

        for (const match of candidates) {
          const rest =
            findSuffixPaths(match.end);

          for (const path of rest) {
            paths.push({
              start: position,
              segments: [
                {
                  word: word.slice(
                    match.start,
                    match.end
                  ),
                  morpheme: 'suffix',
                  start: match.start,
                  end: match.end
                },
                ...path.segments
              ]
            });
          }
        }

        return paths;
      };

      const prefixPaths =
        findPrefixPaths(0);

      /**
       * Maior quantidade de prefixos primeiro.
       *
       * Em empate, maior comprimento consumido primeiro.
       */
      prefixPaths.sort(
        (a, b) =>
          b.segments.length -
          a.segments.length ||
          b.end - a.end
      );

      for (const prefixPath of prefixPaths) {
        const prefixEnd = prefixPath.end;

        /**
         * Não houve prefixo.
         *
         * Nesse caso o suffix NÃO pode começar em zero,
         * porque suffix no início da palavra é proibido.
         *
         * Precisamos reservar pelo menos um grapheme
         * para o root.
         */
        if (prefixEnd === 0) {
          for (
            let rootEnd = 1;
            rootEnd < word.length;
            rootEnd++
          ) {
            const suffixPaths =
              findSuffixPaths(rootEnd);

            for (const suffixPath of suffixPaths) {
              if (
                suffixPath.segments.length === 0
              ) {
                continue;
              }

              return [
                ...prefixPath.segments,

                {
                  word: word.slice(
                    0,
                    rootEnd
                  ),
                  morpheme: 'root',
                  start: 0,
                  end: rootEnd
                },

                ...suffixPath.segments
              ];
            }
          }

          /**
           * Não encontramos suffix.
           *
           * A palavra inteira é root.
           */
          return [
            {
              word,
              morpheme: 'root',
              start: 0,
              end: word.length
            }
          ];
        }

        /**
         * Houve prefixo.
         *
         * Agora procuramos suffix começando:
         *
         * prefixEnd <= suffixStart < word.length
         *
         * Se suffixStart === prefixEnd:
         *
         *     prefix + suffix
         *
         * sem root.
         *
         * Isso é exatamente o caso:
         *
         *     ב֖ + וֹ
         */
        for (
          let suffixStart = prefixEnd;
          suffixStart < word.length;
          suffixStart++
        ) {
          const suffixPaths =
            findSuffixPaths(suffixStart);

          for (const suffixPath of suffixPaths) {
            if (
              suffixPath.segments.length === 0
            ) {
              continue;
            }

            /**
             * Se existe espaço entre prefix e suffix,
             * esse espaço é o root.
             */
            const rootExists =
              suffixStart > prefixEnd;

            /**
             * Se o intervalo entre prefix e suffix
             * não começa em uma fronteira válida,
             * não devemos cortar o grapheme.
             *
             * Como findAll() trabalha com limites de
             * grapheme, podemos simplesmente verificar
             * se existe conteúdo real.
             */
            const root =
              rootExists
                ? {
                  word: word.slice(
                    prefixEnd,
                    suffixStart
                  ),
                  morpheme: 'root' as MorphemeType,
                  start: prefixEnd,
                  end: suffixStart
                }
                : null;

            return [
              ...prefixPath.segments,

              ...(root ? [root] : []),

              ...suffixPath.segments
            ];
          }
        }

        /**
         * Caso em que os prefixos consumiram tudo menos
         * um root final, sem suffix.
         *
         * Ex:
         *
         *     pre + root
         */
        if (prefixEnd < word.length) {
          return [
            ...prefixPath.segments,
            {
              word: word.slice(
                prefixEnd
              ),
              morpheme: 'root',
              start: prefixEnd,
              end: word.length
            }
          ];
        }
      }

      return null;
    };

    const segmentWord = (
      word: string
    ): Segment[] => {
      if (!word) {
        return [];
      }

      const lexemes = findLexemes(word);

      // 1. Primeiro: prefix* + maior root válido + suffix*
      for (const lexeme of lexemes) {
        const segments =
          buildAroundLexeme(
            word,
            lexeme
          );

        if (segments) {
          return segments;
        }
      }

      // 2. Sem lexeme:
      //
      //    prefix* + root? + suffix*
      //
      //    O root pode ser vazio quando
      //    prefix e suffix encostam.
      const withoutLexeme =
        buildWithoutLexeme(word);

      if (withoutLexeme) {
        return withoutLexeme;
      }

      // 3. Fallback
      return [
        {
          word,
          morpheme: 'root',
          start: 0,
          end: word.length
        }
      ];
    };

    let index = 0;

    const words =
      this.splitByLanguageWordSeparator(
        language,
        pharse
      );

    return words
      .map(word => {
        const segments =
          segmentWord(word.word);

        const wordObject: Word = {
          segments: segments.map(
            segment => ({
              index: index++,
              morpheme: segment.morpheme,
              word: segment.word
            })
          )
        };

        if (
          word.separator !== undefined
        ) {
          wordObject.separator =
            word.separator;
        }

        return wordObject;
      })
      .flat();
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
