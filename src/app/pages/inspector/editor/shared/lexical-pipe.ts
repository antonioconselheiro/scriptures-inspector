import { Pipe, PipeTransform } from '@angular/core';
import { BookMetadata } from '@domain/book-metadata-model';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';

@Pipe({
  name: 'lexical'
})
export class LexicalPipe implements PipeTransform {

  transform(value: string, book: BookMetadata | ParsedBookMetadata, listenUpdate?: number): string {
    listenUpdate;
    return book.lexical[value] || '';
  }

}
