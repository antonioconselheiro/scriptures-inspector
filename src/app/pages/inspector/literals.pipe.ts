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

  transform(value: string): string {
    const literals = this.literalsStorage.getLiteral();
    return literals[value] || '';
  }

}
