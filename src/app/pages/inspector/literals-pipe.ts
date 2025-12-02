import { Pipe, PipeTransform } from '@angular/core';
import { DocumentStorage } from './document-storage';

@Pipe({
  name: 'lexical'
})
export class LexicalPipe implements PipeTransform {

  constructor(
    private documentStorage: DocumentStorage
  ) {}

  transform(value: string, lang: 'hebraic' | 'geez' | 'greek', listenUpdate: number): string {
    listenUpdate;
    if (lang === 'hebraic') {
      return this.documentStorage.getHebraicLexical()[value] || '';
    } else if (lang === 'geez') {
      return this.documentStorage.getGeezLexical()[value] || '';
    } else if (lang === 'greek') {
      return this.documentStorage.getGreekLexical()[value] || '';
    }

    return '';
  }

}
