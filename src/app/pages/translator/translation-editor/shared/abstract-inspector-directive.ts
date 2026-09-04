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

  calcFieldSize(segmentWord: string, lexicalValue: string): number {
    if (lexicalValue.length <= 2) {
      return 21;
    } else if (lexicalValue.length) {
      const smalls = lexicalValue.match(/[|iIjl]/g) || [];
      const bigs = lexicalValue.match(/[MW]/gi) || []; 
      return Math.floor(lexicalValue.length * 8.5) - (smalls.length * 8) + (bigs.length * 4);
    } else if (segmentWord.length) {
      return Math.floor(segmentWord.length * 5);
    }

    return 30;
  }

    //  lexical
  updateLexical(sourceLanguage: LanguageUnionType, input: HTMLInputElement, segment: WordSegment, morphemeConfigured: 'root' | 'prefix' | 'suffix'): void {
    const language = this.languageMetadataRecord[sourceLanguage];
    this.metadataService.updateLexical(this.current, this.bookTarget, language, segment.word, input.value, morphemeConfigured);
    input.style.width = `${this.calcFieldSize(segment.word, input.value)}px`;
    this.pipeUpdaterController++;
  }

  cleanLexicalLexical(wordMatrix: Array<Word>): void {
    if (!confirm('remove lexical interlinear from verse and from all it occurrences?')) {
      return;
    }

    this.metadataService.cleanLexical(this.current, this.bookTarget, wordMatrix);
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
