import { Pipe, PipeTransform } from '@angular/core';
import { paleoHebrewSpellingFn } from '@shared/language-metadata/paleo-hebrew-spelling-fn';

@Pipe({
  name: 'paleo'
})
export class PaleoPipe implements PipeTransform {

  transform(value: string): string {
    return paleoHebrewSpellingFn(value);
  }
}
