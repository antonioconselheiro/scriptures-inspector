import { Pipe, PipeTransform } from '@angular/core';
import { transliterate } from "hebrew-transliteration";

@Pipe({
  name: 'transliteration'
})
export class TransliterationPipe implements PipeTransform {

  transform(hebrew: string): string {
    return transliterate(hebrew);
  }

}
