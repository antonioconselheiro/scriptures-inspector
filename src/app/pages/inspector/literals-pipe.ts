import { Pipe, PipeTransform } from '@angular/core';
import { LiteralsStorage } from './literals-storage';

@Pipe({
  name: 'literals'
})
export class LiteralsPipe implements PipeTransform {

  constructor(
    private literalsStorage: LiteralsStorage
  ) {}

  transform(value: string, lang: 'hebraic' | 'geez' | 'greek', listenUpdate: number): string {
    listenUpdate;
    const literals = lang === 'hebraic' ?
      this.literalsStorage.getHebraicLiteral() :
      this.literalsStorage.getGeezLiteral();

    return literals[value] || '';
  }

}
