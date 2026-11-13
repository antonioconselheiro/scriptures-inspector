import { Directive, Input } from '@angular/core';
import { BookMetadataAttributes } from '@domain/book-metadata-attributes-model';
import { Book } from '@domain/book-model';
import { CurrentChapter } from '@domain/current-chapter-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { Project } from '@domain/project-model';
import { Word } from '@domain/word-model';
import { WordSegment } from '@domain/word-segment-model';
import { getProjectLanguageFn } from '@shared/language-metadata/get-project-language-fn';
import { languageMetadataRecord } from '@shared/language-metadata/language-metadata-record';
import { ProjectMetadataService } from './project/project-metadata-service';

@Directive()
export abstract class AbstractInspectorDiretive {

  private readonly languageCache = new Map<LanguageUnionType, {
    project: Project;
    normalization: string;
    language: ReturnType<typeof getProjectLanguageFn>;
  }>();

  private readonly parsedBookCache = new WeakMap<BookMetadataAttributes, {
    project: Project;
    languageName: LanguageUnionType;
    language: ReturnType<typeof getProjectLanguageFn>;
    patternsSignature: string;
    parsedBook: ParsedBookMetadata;
  }>();

  @Input()
  abstract pipeUpdaterController: number;

  @Input()
  abstract current: CurrentChapter;

  @Input()
  abstract bookTarget: Book<BookMetadataAttributes, any>;

  @Input({ required: true })
  abstract project: Project;

  readonly languageMetadataRecord = languageMetadataRecord;

  protected abstract metadataService: ProjectMetadataService;

  calcFieldSize(segmentWord: string, lexicalValue: string): number {
    if (lexicalValue.length <= 2) {
      return 21;
    } else if (lexicalValue.length) {
      let smallCount = 0;
      let bigCount = 0;
      for (let index = 0; index < lexicalValue.length; index++) {
        const character = lexicalValue[index];
        if ('|iItjl() '.includes(character)) {
          smallCount++;
        }
        if ('ABCDEFGHJKLMNOPQRSTUVWXYZmw'.includes(character)) {
          bigCount++;
        }
      }

      return Math.floor(lexicalValue.length * 8.5) - (smallCount * 5) + (bigCount * 4);
    } else if (segmentWord.length) {
      return Math.floor(segmentWord.length * 5);
    }

    return 30;
  }

    //  lexical
  updateLexical(sourceLanguage: LanguageUnionType, input: HTMLInputElement, segment: WordSegment, morphemeConfigured: 'root' | 'prefix' | 'suffix'): void {
      const language = this.getLanguageAttributes(sourceLanguage);
    this.metadataService.updateLexical(this.current, this.bookTarget, language, segment.word, input.value, morphemeConfigured);
    input.style.width = `${this.calcFieldSize(segment.word, input.value)}px`;
    this.pipeUpdaterController++;
  }

  cleanLexicalLexical(wordMatrix: Array<Word>, sourceLanguage: LanguageUnionType): void {
    if (!confirm('remove lexical interlinear from verse and from all it occurrences?')) {
      return;
    }

    this.metadataService.cleanLexical(this.current, this.bookTarget, wordMatrix, this.getLanguageAttributes(sourceLanguage));
    this.pipeUpdaterController++;
  }

  parseBook(book: BookMetadataAttributes, languageName: LanguageUnionType): ParsedBookMetadata {
    const patternsSignature = JSON.stringify(book.patterns) ?? '';
    const language = this.getLanguageAttributes(languageName);
    let cached = this.parsedBookCache.get(book);
    if (
      !cached
      || cached.project !== this.project
      || cached.languageName !== languageName
      || cached.language !== language
      || cached.patternsSignature !== patternsSignature
    ) {
      cached = {
        project: this.project,
        languageName,
        language,
        patternsSignature,
        parsedBook: {
          lexical: book.lexical,
          patterns: this.metadataService.parsePattern(book.patterns, language)
        }
      };
      this.parsedBookCache.set(book, cached);
    } else {
      cached.parsedBook.lexical = book.lexical;
    }

    return cached.parsedBook;
  }

  protected getLanguageAttributes(languageName: LanguageUnionType): ReturnType<typeof getProjectLanguageFn> {
    const normalization = JSON.stringify(this.project.normalization?.[languageName] ?? []);
    let cached = this.languageCache.get(languageName);
    if (
      !cached
      || cached.project !== this.project
      || cached.normalization !== normalization
    ) {
      cached = {
        project: this.project,
        normalization,
        language: getProjectLanguageFn(this.project, languageName)
      };
      this.languageCache.set(languageName, cached);
    }

    return cached.language;
  }
}
