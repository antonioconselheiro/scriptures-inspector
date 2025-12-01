import { Pipe, PipeTransform } from '@angular/core';
import { DocumentStorage } from './document-storage';

@Pipe({
  name: 'literals'
})
export class LiteralsPipe implements PipeTransform {

  constructor(
    private literalsStorage: DocumentStorage
  ) {}

  transform(value: string, lang: 'hebraic' | 'geez' | 'greek', listenUpdate: number): string {
    listenUpdate;
    const literals = lang === 'hebraic' ?
      this.literalsStorage.getHebraicLexical() :
      this.literalsStorage.getGeezLexical();

    return literals[value] || '';
  }

}
