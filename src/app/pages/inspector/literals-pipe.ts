import { Pipe, PipeTransform } from '@angular/core';
import { LiteralsStorage } from './literals-storage';

@Pipe({
  name: 'literals',
  pure: false
})
export class LiteralsPipe implements PipeTransform {

  constructor(
    private literalsStorage: LiteralsStorage
  ) {}

  transform(value: string, lang: 'hebraic' | 'geez' | 'greek'): string {
    const literals = lang === 'hebraic' ?
      this.literalsStorage.getHebraicLiteral() :
      this.literalsStorage.getGeezLiteral();

    return literals[value] || '';
  }

}
