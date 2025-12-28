import { Directive, Input } from '@angular/core';
import { ParsedPatterns } from '@domain/parsed-patterns';
import { ProjectData } from '@domain/project-data-model';
import { ProjectMetadataService } from '@shared/project/project-metadata-service';
import { LiteralsPatternsService } from '../literals-patterns-service';
import { CurrentChapter } from '@domain/current-chapter-model';

@Directive()
export abstract class AbstractInspectorDiretive {

  @Input()
  abstract pipeUpdaterController: number;

  @Input()
  abstract data: ProjectData;

  @Input()
  abstract current: CurrentChapter;

  protected abstract literalsPatternsService: LiteralsPatternsService;
  protected abstract projectMetadataService: ProjectMetadataService;

  splitIntoMatrix(patterns: ParsedPatterns, text: string): Array<Array<{ index: number, word: string }>> {
    let index = 0;
    return text.split(' ').map(word => this.literalsPatternsService.splitByPatterns(patterns, word).map(word => {
      return { index: index++, word };
    }));
  }

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
    this.projectMetadataService.updateLexical(this.data, this.current.book, word, input.value);

    input.style.width = `${this.calcFieldSize(word, input.value)}px`;
    this.pipeUpdaterController++;
  }

  getLexical(word: string): string {
    return this.projectMetadataService.getLexical(this.data, this.current.book, word);
  }

  cleanLexicalInterlinear(eachWord: Array<Array<{ index: number; word: string; }>>): void {
    if (!confirm('remove lexical interlinear from verse and from all it occurrences?')) {
      return;
    }

    this.projectMetadataService.cleanLexicalInterlinear(this.data, this.current.book, eachWord);
    this.pipeUpdaterController++;
  }
}
