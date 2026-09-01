import { Pipe, PipeTransform } from '@angular/core';
import { BookMetadataAttributes } from '@domain/book-metadata-attributes-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { languageMetadataRecord } from '@shared/language-metadata/language-metadata-record';
import { ProjectDataService } from './project/project-data-service';

@Pipe({
  name: 'lexical'
})
export class LexicalPipe implements PipeTransform {

  constructor(
    private dataService: ProjectDataService
  ) { }

  transform(
    value: string,
    book: BookMetadataAttributes | ParsedBookMetadata,
    languageName: LanguageUnionType,
    morpheme: 'common' | 'prefix' | 'suffix',
    listenUpdate?: number
  ): { config: 'common' | 'prefix' | 'suffix', value: string } {
    listenUpdate;

    return this.dataService.getLexical(book, languageMetadataRecord[languageName], value, morpheme);
  }

}
