import { Pipe, PipeTransform } from '@angular/core';
import { CodexBookMetadata } from '@domain/codex-book-metadata-model';

@Pipe({
  name: 'lexical'
})
export class LexicalPipe implements PipeTransform {

  transform(value: string, book: CodexBookMetadata, listenUpdate?: number): string {
    listenUpdate;
    return book.lexical[value] || '';
  }

}
