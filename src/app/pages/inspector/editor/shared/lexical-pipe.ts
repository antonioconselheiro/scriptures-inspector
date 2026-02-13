import { Pipe, PipeTransform } from '@angular/core';
import { BookMetadataAttributes } from '@domain/book-metadata-attributes-model';
import { Language } from '@domain/language-model';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';

@Pipe({
  name: 'lexical'
})
export class LexicalPipe implements PipeTransform {

  transform(value: string, book: BookMetadataAttributes | ParsedBookMetadata, language: Language, listenUpdate?: number): string {
    listenUpdate;
    const normalizeFn = language.normalizeFn ? language.normalizeFn : (word: string) => word;
    return book.lexical[normalizeFn(value)] || '';
  }

}
