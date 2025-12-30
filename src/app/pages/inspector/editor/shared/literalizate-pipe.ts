import { Pipe, PipeTransform } from '@angular/core';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { ProjectService } from './project/project-service';

@Pipe({
  name: 'literalizate'
})
export class LiteralizatePipe implements PipeTransform {

  constructor(
    private projectService: ProjectService
  ) { }

  transform(value: string, book: ParsedBookMetadata, listenUpdate?: number): string {
    listenUpdate;

    return value.split(' ').map(sentence => {
      let literalWord: string[] = [];
      for (let word of this.projectService.splitByPatterns(book.patterns, sentence)) {
        literalWord.push(book.lexical[word]);
      }

      return literalWord.join(' ');
    }).join(' ');
  }

}
