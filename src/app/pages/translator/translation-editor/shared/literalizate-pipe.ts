import { Pipe, PipeTransform } from '@angular/core';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { ProjectDataService } from './project/project-data-service';
import { Language } from '@domain/language-model';

@Pipe({
  name: 'literalizate'
})
export class LiteralizatePipe implements PipeTransform {

  constructor(
    private projectDataService: ProjectDataService
  ) { }

  transform(text: string, book: ParsedBookMetadata, sourceLanguage: Language, listenUpdate?: number): string {
    listenUpdate;
    const normalizeFn = sourceLanguage.normalizeFn ? sourceLanguage.normalizeFn : (word: string) => word;

    const wordMatrix = this.projectDataService.splitIntoMatrix(sourceLanguage, book.patterns, text);
    return wordMatrix.map(word => word.segments.map(segment => book.lexical[normalizeFn(segment.word)]).join(' ')).join(' ');
  }

}
