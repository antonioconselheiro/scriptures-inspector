import { Pipe, PipeTransform } from '@angular/core';
import { BookMetadataAttributes } from '@domain/book-metadata-attributes-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { Project } from '@domain/project-model';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { getProjectLanguageFn } from '@shared/language-metadata/get-project-language-fn';
import { ProjectDataService } from './project/project-data-service';
import { MorphemeType } from '@domain/morpheme-type';

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
    morpheme: MorphemeType,
    listenUpdate: number,
    project: Project
  ): { config: MorphemeType, value: string } {
    listenUpdate;

    return this.dataService.getLexical(book, getProjectLanguageFn(project, languageName), value, morpheme);
  }

}
