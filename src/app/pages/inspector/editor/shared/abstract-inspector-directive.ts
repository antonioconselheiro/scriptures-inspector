import { Directive, Input } from '@angular/core';
import { BookMetadataAttributes } from '@domain/book-metadata-attributes-model';
import { Book } from '@domain/book-model';
import { CurrentChapter } from '@domain/current-chapter-model';
import { ProjectMetadataService } from './project/project-metadata-service';

@Directive()
export abstract class AbstractInspectorDiretive {

  @Input()
  abstract pipeUpdaterController: number;

  @Input()
  abstract current: CurrentChapter;

  @Input()
  abstract bookTarget: Book<BookMetadataAttributes, any>;

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
  updateLexical(input: HTMLInputElement, word: string): void {
    this.projectMetadataService.updateLexical(this.current, this.bookTarget, word, input.value);

    input.style.width = `${this.calcFieldSize(word, input.value)}px`;
    this.pipeUpdaterController++;
  }

  getLexical(word: string): string {
    return this.projectMetadataService.getLexical(this.bookTarget, word);
  }

  cleanLexicalInterlinear(eachWord: Array<Array<{ index: number; word: string; }>>): void {
    if (!confirm('remove lexical interlinear from verse and from all it occurrences?')) {
      return;
    }

    this.projectMetadataService.cleanLexicalInterlinear(this.current, this.bookTarget, eachWord);
    this.pipeUpdaterController++;
  }
}
