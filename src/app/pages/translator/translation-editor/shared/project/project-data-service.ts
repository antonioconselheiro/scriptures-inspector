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
    const normalize = language.normalizeFn
      ? language.normalizeFn
      : (text: string) => text;

    type Pattern = {
      text: string;
      normalized: string;
    };

    type Match = {
      start: number;
      end: number;
      pattern: string;
    };

    type NormalizedWord = {
      original: string;
      normalized: string;
      boundaries: number[];
    };

    type Segment = {
      word: string;
      morpheme: MorphemeType;
      start: number;
      end: number;
    };

    /**
     * Prepara todos os patterns uma única vez.
     *
     * O Map contém:
     *
     *   pattern -> RegExp
     *
     * Para a segmentação só precisamos da chave.
     */
    const preparePatterns = (
      entries: Map<string, RegExp>
    ): Pattern[] =>
      Array.from(entries.keys())
        .map(text => ({
          text,
          normalized: normalize(text)
        }))
        .filter(item => item.normalized.length > 0)
        .sort(
          (a, b) =>
            b.normalized.length -
            a.normalized.length
        );

    const prefixPatterns =
      preparePatterns(patterns.prefix);

    const suffixPatterns =
      preparePatterns(patterns.suffix);

    const lexemePatterns =
      preparePatterns(patterns.lexeme);

    /**
     * Normaliza a palavra preservando a correspondência
     * entre índices normalizados e índices originais.
     *
     * Cada grapheme é normalizado isoladamente.
     *
     * Isso é importante para hebraico:
     *
     *   ב֖ -> ב
     *   וֹ -> ו
     */
    const normalizeWord = (
      original: string
    ): NormalizedWord => {
      const segmenter = new Intl.Segmenter(
        undefined,
        { granularity: 'grapheme' }
      );

      let normalized = '';

      const boundaries: number[] = [0];

      for (const grapheme of segmenter.segment(original)) {
        const originalStart = grapheme.index;
        const originalEnd =
          grapheme.index + grapheme.segment.length;

        const normalizedGrapheme =
          normalize(grapheme.segment);

        if (!normalizedGrapheme) {
          continue;
        }

        normalized += normalizedGrapheme;

        /**
         * Cada caractere normalizado aponta para:
         *
         * início do grapheme original
         *
         * exceto o último, que aponta para o fim.
         */
        for (
          let i = 0;
          i < normalizedGrapheme.length;
          i++
        ) {
          boundaries.push(
            i === normalizedGrapheme.length - 1
              ? originalEnd
              : originalStart
          );
        }
      }

      return {
        original,
        normalized,
        boundaries
      };
    };

    const createSegment = (
      word: NormalizedWord,
      start: number,
      end: number,
      morpheme: MorphemeType
    ): Segment => ({
      word: word.original.slice(
        word.boundaries[start],
        word.boundaries[end]
      ),
      morpheme,
      start: word.boundaries[start],
      end: word.boundaries[end]
    });

    /**
     * Maior pattern que começa em `position`.
     *
     * Os patterns já estão ordenados por tamanho.
     */
    const matchAt = (
      text: string,
      position: number,
      patternList: Pattern[]
    ): Match | null => {
      for (const pattern of patternList) {
        if (
          text.startsWith(
            pattern.normalized,
            position
          )
        ) {
          return {
            start: position,
            end:
              position +
              pattern.normalized.length,
            pattern: pattern.text
          };
        }
      }

      return null;
    };

    /**
     * Maior suffix que termina exatamente em `end`.
     */
    const matchSuffixAt = (
      text: string,
      end: number,
      patternList: Pattern[]
    ): Match | null => {
      for (const pattern of patternList) {
        const start =
          end - pattern.normalized.length;

        if (
          start >= 0 &&
          text.startsWith(
            pattern.normalized,
            start
          )
        ) {
          return {
            start,
            end,
            pattern: pattern.text
          };
        }
      }

      return null;
    };

    /**
     * Procura os lexemas existentes dentro da palavra.
     *
     * A busca é feita uma única vez.
     */
    const findLexemes = (
      normalized: string
    ): Match[] => {
      const matches: Match[] = [];

      for (const pattern of lexemePatterns) {
        let position = 0;

        while (position < normalized.length) {
          const start =
            normalized.indexOf(
              pattern.normalized,
              position
            );

          if (start === -1) {
            break;
          }

          const end =
            start +
            pattern.normalized.length;

          matches.push({
            start,
            end,
            pattern: pattern.text
          });

          position = end;
        }
      }

      return matches.sort(
        (a, b) =>
          (b.end - b.start) -
          (a.end - a.start) ||
          a.start - b.start
      );
    };

    /**
     * =========================================================
     * COM LEXEMA
     * =========================================================
     *
     * prefix* + root + suffix*
     *
     * O lexema só é aceito quando conseguimos consumir
     * a palavra inteira.
     */
    const segmentWithLexeme = (
      word: NormalizedWord,
      lexeme: Match
    ): Segment[] | null => {
      /**
       * ---------------------------------------------------------
       * Encontra uma cadeia de patterns que:
       *
       *   começa em `start`
       *   termina exatamente em `target`
       *
       * Os patterns já estão ordenados do maior para o menor.
       *
       * Isso é importante porque:
       *
       *   prefix = ["presu", "pre"]
       *   lexeme = "supercore"
       *
       * Para "presupercore":
       *
       *   presu -> não chega ao lexema
       *   pre   -> chega ao lexema
       *
       * Portanto o prefixo maior não pode simplesmente
       * eliminar o lexema.
       */
      const findChain = (
        text: string,
        start: number,
        target: number,
        patternList: Pattern[]
      ): Match[] | null => {
        if (start === target) {
          return [];
        }

        if (start > target) {
          return null;
        }

        for (const pattern of patternList) {
          if (
            text.startsWith(
              pattern.normalized,
              start
            )
          ) {
            const end =
              start + pattern.normalized.length;

            if (end > target) {
              continue;
            }

            const rest = findChain(
              text,
              end,
              target,
              patternList
            );

            if (rest !== null) {
              return [
                {
                  start,
                  end,
                  pattern: pattern.text
                },
                ...rest
              ];
            }
          }
        }

        return null;
      };

      /**
       * ---------------------------------------------------------
       * PREFIXOS
       * ---------------------------------------------------------
       *
       * Precisamos encontrar uma cadeia que termine
       * exatamente em lexeme.start.
       */
      const prefixes =
        findChain(
          word.normalized,
          0,
          lexeme.start,
          prefixPatterns
        );

      if (prefixes === null) {
        return null;
      }

      /**
       * ---------------------------------------------------------
       * SUFIXOS
       * ---------------------------------------------------------
       *
       * Precisamos encontrar uma cadeia que comece exatamente
       * em lexeme.end e termine no final da palavra.
       */
      const suffixes =
        findChain(
          word.normalized,
          lexeme.end,
          word.normalized.length,
          suffixPatterns
        );

      if (suffixes === null) {
        return null;
      }

      /**
       * ---------------------------------------------------------
       * RESULTADO
       * ---------------------------------------------------------
       */
      return [
        ...prefixes.map(item =>
          createSegment(
            word,
            item.start,
            item.end,
            'prefix'
          )
        ),

        createSegment(
          word,
          lexeme.start,
          lexeme.end,
          'root'
        ),

        ...suffixes.map(item =>
          createSegment(
            word,
            item.start,
            item.end,
            'suffix'
          )
        )
      ];
    };

    /**
     * =========================================================
     * SEM LEXEMA
     * =========================================================
     *
     * Aqui precisamos preservar as regras antigas.
     *
     * A estrutura permitida é:
     *
     *   prefix* + root + suffix*
     *
     * ou:
     *
     *   prefix* + suffix*
     *
     * quando prefix e suffix encostam.
     *
     * Porém:
     *
     *   suffix NÃO pode começar em zero.
     *
     * Isso evita transformar uma palavra inteira em suffixes.
     */
    const segmentWithoutLexeme = (
      word: NormalizedWord
    ): Segment[] => {
      const text = word.normalized;
      const length = text.length;

      if (!length) {
        return [];
      }

      /**
       * ---------------------------------------------------------
       * 1. Prefixos
       * ---------------------------------------------------------
       *
       * Consumimos somente prefixos que começam em zero.
       *
       * Como os patterns estão ordenados por tamanho,
       * escolhemos sempre o maior.
       */
      const prefixes: Match[] = [];

      let prefixEnd = 0;

      while (prefixEnd < length) {
        const prefix =
          matchAt(
            text,
            prefixEnd,
            prefixPatterns
          );

        if (!prefix) {
          break;
        }

        /**
         * Não podemos deixar o prefixo consumir
         * a palavra inteira.
         *
         * Se isso acontecer, tratamos a palavra
         * como root abaixo.
         */
        if (prefix.end === length) {
          break;
        }

        prefixes.push(prefix);

        prefixEnd = prefix.end;
      }

      /**
       * ---------------------------------------------------------
       * 2. Procuramos suffixes da direita
       * ---------------------------------------------------------
       *
       * Existe uma diferença importante aqui:
       *
       * NÃO procuramos suffix a partir de zero.
       *
       * O primeiro suffix precisa deixar pelo menos
       * um caractere de root, EXCETO quando já existe
       * prefixo e prefix + suffix podem encostar.
       *
       * Exemplo:
       *
       *   ababa
       *
       *   prefix = a
       *
       *   suffixes = b + a + b + a
       *
       * Isso é válido.
       *
       * Mas:
       *
       *   ababa
       *
       *   suffixes = a + b + a + b + a
       *
       * não é válido, pois suffix começaria em zero.
       */

      /**
       * Primeiro tentamos encontrar uma cadeia de suffixes
       * partindo do final.
       *
       * O resultado é armazenado da esquerda para a direita.
       */
      const suffixes: Match[] = [];

      let suffixStart = length;

      while (suffixStart > prefixEnd) {
        const suffix =
          matchSuffixAt(
            text,
            suffixStart,
            suffixPatterns
          );

        if (!suffix) {
          break;
        }

        /**
         * Não pode atravessar os prefixos.
         */
        if (suffix.start < prefixEnd) {
          break;
        }

        suffixes.unshift(suffix);

        suffixStart = suffix.start;
      }

      /**
       * ---------------------------------------------------------
       * 3. Caso prefix + suffix sem root
       * ---------------------------------------------------------
       *
       * Ex:
       *
       *   ב֖וֹ
       *
       *   prefix = ב֖
       *   suffix = וֹ
       *
       * Aqui:
       *
       *   prefixEnd === suffixStart
       *
       * Portanto não existe root.
       *
       * Isso é deliberadamente permitido.
       */
      if (
        prefixes.length > 0 &&
        suffixes.length > 0 &&
        suffixStart === prefixEnd
      ) {
        return [
          ...prefixes.map(item =>
            createSegment(
              word,
              item.start,
              item.end,
              'prefix'
            )
          ),

          ...suffixes.map(item =>
            createSegment(
              word,
              item.start,
              item.end,
              'suffix'
            )
          )
        ];
      }

      /**
       * ---------------------------------------------------------
       * 4. Caso prefix + root + suffix
       * ---------------------------------------------------------
       *
       * Se sobrou alguma coisa entre prefix e suffix,
       * isso é o root.
       */
      if (
        suffixes.length > 0 &&
        suffixStart > prefixEnd
      ) {
        return [
          ...prefixes.map(item =>
            createSegment(
              word,
              item.start,
              item.end,
              'prefix'
            )
          ),

          createSegment(
            word,
            prefixEnd,
            suffixStart,
            'root'
          ),

          ...suffixes.map(item =>
            createSegment(
              word,
              item.start,
              item.end,
              'suffix'
            )
          )
        ];
      }

      /**
       * ---------------------------------------------------------
       * 5. Caso somente prefix + root
       * ---------------------------------------------------------
       *
       * Ex:
       *
       *   pre + word
       */
      if (
        prefixes.length > 0 &&
        prefixEnd < length
      ) {
        return [
          ...prefixes.map(item =>
            createSegment(
              word,
              item.start,
              item.end,
              'prefix'
            )
          ),

          createSegment(
            word,
            prefixEnd,
            length,
            'root'
          )
        ];
      }

      /**
       * ---------------------------------------------------------
       * 6. Caso somente suffix
       * ---------------------------------------------------------
       *
       * IMPORTANTE:
       *
       * suffix no início da palavra é proibido.
       *
       * Portanto precisamos reservar pelo menos um
       * caractere inicial para o root.
       *
       * Procuramos a maior cadeia de suffixes que começa
       * depois da primeira posição.
       */
      if (prefixes.length === 0) {
        /**
         * Testamos somente as possíveis fronteiras
         * de início do suffix.
         *
         * Isso é O(n * patterns), não gera combinações.
         */
        for (let rootEnd = 1; rootEnd < length; rootEnd++) {
          const candidateSuffixes: Match[] = [];

          let position = rootEnd;
          let valid = true;

          while (position < length) {
            const suffix =
              matchAt(
                text,
                position,
                suffixPatterns
              );

            if (!suffix) {
              valid = false;
              break;
            }

            candidateSuffixes.push(suffix);

            position = suffix.end;
          }

          if (
            valid &&
            candidateSuffixes.length > 0 &&
            position === length
          ) {
            return [
              createSegment(
                word,
                0,
                rootEnd,
                'root'
              ),

              ...candidateSuffixes.map(item =>
                createSegment(
                  word,
                  item.start,
                  item.end,
                  'suffix'
                )
              )
            ];
          }
        }
      }

      /**
       * ---------------------------------------------------------
       * 7. Fallback
       * ---------------------------------------------------------
       *
       * Se nenhuma estrutura morfológica válida foi encontrada,
       * a palavra inteira é root.
       */
      return [
        createSegment(
          word,
          0,
          length,
          'root'
        )
      ];
    };

    /**
     * =========================================================
     * SEGMENTAÇÃO DE UMA PALAVRA
     * =========================================================
     */
    const segmentWord = (
      originalWord: string
    ): Segment[] => {
      if (!originalWord) {
        return [];
      }

      const word =
        normalizeWord(originalWord);

      /**
       * 1. Lexemas têm prioridade.
       *
       * Mas cada lexema precisa produzir uma segmentação
       * completa da palavra.
       */
      const lexemes =
        findLexemes(word.normalized);

      let bestSegments: Segment[] | null = null;
      let bestLexeme: Match | null = null;

      for (const lexeme of lexemes) {
        const segments =
          segmentWithLexeme(
            word,
            lexeme
          );

        if (!segments) {
          continue;
        }

        if (!bestSegments || !bestLexeme) {
          bestSegments = segments;
          bestLexeme = lexeme;
          continue;
        }

        /**
         * Prioridade:
         *
         * 1. maior lexema
         * 2. menor quantidade de segmentos
         * 3. lexema mais à esquerda
         *
         * Isso evita que um lexema interno menor
         * "roube" partes que deveriam pertencer ao root.
         */
        const currentLexemeLength =
          lexeme.end - lexeme.start;

        const bestLexemeLength =
          bestLexeme.end - bestLexeme.start;

        if (
          currentLexemeLength > bestLexemeLength ||
          (
            currentLexemeLength === bestLexemeLength &&
            (
              segments.length < bestSegments.length ||
              (
                segments.length === bestSegments.length &&
                lexeme.start < bestLexeme.start
              )
            )
          )
        ) {
          bestSegments = segments;
          bestLexeme = lexeme;
        }
      }

      if (bestSegments) {
        return bestSegments;
      }

      /**
       * 2. Sem lexema.
       */
      return segmentWithoutLexeme(word);
    };

    /**
     * =========================================================
     * CONSTRUÇÃO FINAL
     * =========================================================
     */
    let index = 0;

    return this
      .splitByLanguageWordSeparator(
        language,
        pharse
      )
      .map(item => {
        const segments =
          segmentWord(item.word);

        const word: Word = {
          segments: segments.map(segment => ({
            index: index++,
            morpheme: segment.morpheme,
            word: segment.word
          }))
        };

        if (
          item.separator !== undefined
        ) {
          word.separator = item.separator;
        }

        return word;
      });
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
