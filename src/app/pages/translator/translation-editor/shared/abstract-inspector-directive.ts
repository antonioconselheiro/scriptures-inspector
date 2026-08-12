import { Directive, Input } from '@angular/core';
import { BookMetadataAttributes } from '@domain/book-metadata-attributes-model';
import { Book } from '@domain/book-model';
import { CurrentChapter } from '@domain/current-chapter-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { Word } from '@domain/word-model';
import { WordSegment } from '@domain/word-segment-model';
import { languageMetadataRecord } from '@shared/language-metadata/language-metadata-record';
import { ProjectMetadataService } from './project/project-metadata-service';

@Directive()
export abstract class AbstractInspectorDiretive {

  @Input()
  abstract pipeUpdaterController: number;

  @Input()
  abstract current: CurrentChapter;

  @Input()
  abstract bookTarget: Book<BookMetadataAttributes, any>;

  readonly languageMetadataRecord = languageMetadataRecord;

  protected abstract metadataService: ProjectMetadataService;

  calcFieldSize(segment: WordSegment, value: string): number {
    if (value.length === 2) {
      return 21;
    } else if (value.length) {
      return Math.floor(value.length * 8.5);
    } else if (segment.word.length) {
      return Math.floor(segment.word.length * 5);
    }

    return 30;
  }

    //  lexical
  updateLexical(sourceLanguage: LanguageUnionType, input: HTMLInputElement, segment: WordSegment): void {
    const language = this.languageMetadataRecord[sourceLanguage];
    this.metadataService.updateLexical(this.current, this.bookTarget, language, segment.word, input.value);
    input.style.width = `${this.calcFieldSize(segment, input.value)}px`;
    this.pipeUpdaterController++;
  }

  cleanLexicalInterlinear(wordMatrix: Array<Word>): void {
    if (!confirm('remove lexical interlinear from verse and from all it occurrences?')) {
      return;
    }

    this.metadataService.cleanLexicalInterlinear(this.current, this.bookTarget, wordMatrix);
    this.pipeUpdaterController++;
  }

  parseBook(book: BookMetadataAttributes, languageName: LanguageUnionType): ParsedBookMetadata {
    const languageAttributes = this.languageMetadataRecord[languageName];
    const parsedPatterns = this.metadataService.parsePattern(book.patterns, languageAttributes);

    return {
      lexical: book.lexical,
      patterns: parsedPatterns
    };
  }
}
