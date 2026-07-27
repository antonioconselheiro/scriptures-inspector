import { Pipe, PipeTransform } from '@angular/core';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { ProjectDataService } from './project/project-data-service';
import { Language } from '@domain/language-model';

@Pipe({
  name: 'literalizate'
})
export class LiteralizatePipe implements PipeTransform {

  constructor(
    private projectService: ProjectDataService,
    private projectDataService: ProjectDataService
  ) { }

  transform(text: string, book: ParsedBookMetadata, sourceLanguage: Language, listenUpdate?: number): string {
    listenUpdate;
    const normalizeFn = sourceLanguage.normalizeFn ? sourceLanguage.normalizeFn : (word: string) => word;
    const word = this.projectDataService.splitByLanguageWordSeparator(sourceLanguage, text);

    return word.map(sentence => {
      let literalWord: string[] = [];
      for (let word of this.projectService.splitByPatterns(sourceLanguage, book.patterns, sentence)) {
        literalWord.push(book.lexical[normalizeFn(word)]);
      }

      return literalWord.join(' ');
    }).join(' ');
  }

}
