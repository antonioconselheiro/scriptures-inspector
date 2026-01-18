import { Pipe, PipeTransform } from '@angular/core';
import { BookMetadataAttributes } from '@domain/book-metadata-attributes-model';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';

@Pipe({
  name: 'lexical'
})
export class LexicalPipe implements PipeTransform {

  transform(value: string, book: BookMetadataAttributes | ParsedBookMetadata, listenUpdate?: number): string {
    listenUpdate;
    return book.lexical[value] || '';
  }

}
