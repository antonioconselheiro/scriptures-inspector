import { Pipe, PipeTransform } from '@angular/core';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { ProjectDataService } from './project/project-data-service';
import { Language } from '@domain/language-model';

@Pipe({
  name: 'literalizate'
})
export class LiteralizatePipe implements PipeTransform {

  constructor(
    private projectService: ProjectDataService
  ) { }

  transform(value: string, book: ParsedBookMetadata, sourceLanguage: Language, listenUpdate?: number): string {
    listenUpdate;
    const normalizeFn = sourceLanguage.normalizeFn ? sourceLanguage.normalizeFn : (word: string) => word;

    return value.split(' ').map(sentence => {
      let literalWord: string[] = [];
      for (let word of this.projectService.splitByPatterns(book.patterns, sentence)) {
        literalWord.push(book.lexical[normalizeFn(word)]);
      }

      return literalWord.join(' ');
    }).join(' ');
  }

}
