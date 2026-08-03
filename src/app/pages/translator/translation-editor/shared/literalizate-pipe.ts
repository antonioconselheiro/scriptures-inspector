import { Pipe, PipeTransform } from '@angular/core';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { ProjectDataService } from './project/project-data-service';
import { Language } from '@domain/language-model';

@Pipe({
  name: 'literalizate'
})
export class LiteralizatePipe implements PipeTransform {

  constructor(
    private dataService: ProjectDataService
  ) { }

  transform(text: string, book: ParsedBookMetadata, sourceLanguage: Language, listenUpdate?: number): string {
    listenUpdate;

    const wordMatrix = this.dataService.splitIntoMatrix(sourceLanguage, book.patterns, text);
    return wordMatrix.map(word => {
      return word.segments.map(segment => {
        return this.dataService.getLexical(book, sourceLanguage, segment.word);
      }).join(' ');
    }).join(' ');
  }

}
