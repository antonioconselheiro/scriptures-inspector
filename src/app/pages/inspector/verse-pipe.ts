import { Pipe, PipeTransform } from '@angular/core';
import { ScriptureVerse } from './domain/scripture-verse-model';

@Pipe({
  name: 'verse'
})
export class VersePipe implements PipeTransform {

  transform(value: ScriptureVerse): string {
    if (value.verse.start != value.verse.end) {
      return `${value.verse.start}-${value.verse.end}`;
    }

    return value.verse.start;
  }

}
