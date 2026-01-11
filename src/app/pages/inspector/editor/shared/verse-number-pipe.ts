import { Pipe, PipeTransform } from '@angular/core';
import { SourceVerse } from '@domain/source-verse-model';

@Pipe({
  name: 'verseNumber'
})
export class VerseNumberPipe implements PipeTransform {

  transform(value: SourceVerse): string {
    if (value.verse.start != value.verse.end) {
      return `${value.verse.start}-${value.verse.end}`;
    }

    return value.verse.start;
  }

}
