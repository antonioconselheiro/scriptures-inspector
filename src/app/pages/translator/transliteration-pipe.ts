import { Pipe, PipeTransform } from '@angular/core';
import { transliterate as hebrewTransliterate } from 'hebrew-transliteration';
import { transliterate } from 'transliteration';

@Pipe({
  name: 'transliteration'
})
export class TransliterationPipe implements PipeTransform {

  transform(word: string, language: 'hebraic' | 'geez' | 'greek'): string {
    return language === 'hebraic' ? hebrewTransliterate(word) : transliterate(word);
  }

}
