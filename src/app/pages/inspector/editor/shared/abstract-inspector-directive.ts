import { Directive, Input } from '@angular/core';
import { BookMetadataAttributes } from '@domain/book-metadata-attributes-model';
import { Book } from '@domain/book-model';
import { CurrentChapter } from '@domain/current-chapter-model';
import { LanguageUnionType } from '@domain/language-union-type';
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

  protected abstract projectMetadataService: ProjectMetadataService;

  calcFieldSize(placeholder: string, value: string): number {
    if (value.length) {
      return Math.floor(value.length * 8.5);
    } else if (placeholder.length) {
      return Math.floor(placeholder.length * 5);
    }

    return 30;
  }

    //  lexical
  updateLexical(sourceLanguage: LanguageUnionType, input: HTMLInputElement, word: string): void {
    const language = this.languageMetadataRecord[sourceLanguage];
    this.projectMetadataService.updateLexical(this.current, this.bookTarget, language, word, input.value);
    input.style.width = `${this.calcFieldSize(word, input.value)}px`;
    this.pipeUpdaterController++;
  }

  cleanLexicalInterlinear(eachWord: Array<Array<{ index: number; word: string; }>>): void {
    if (!confirm('remove lexical interlinear from verse and from all it occurrences?')) {
      return;
    }

    this.projectMetadataService.cleanLexicalInterlinear(this.current, this.bookTarget, eachWord);
    this.pipeUpdaterController++;
  }
}
