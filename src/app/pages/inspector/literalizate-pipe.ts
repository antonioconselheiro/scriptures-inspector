import { Pipe, PipeTransform } from '@angular/core';
import { DocumentStorage } from './document-storage';
import { LiteralsPatternsService } from './literals-patterns-service';
import { ParsedPatterns } from './parsed-patterns';

@Pipe({
  name: 'literalizate'
})
export class LiteralizatePipe implements PipeTransform {

  constructor(
    private literalsStorage: DocumentStorage,
    private literalsPatternsService: LiteralsPatternsService
  ) { }

  transform(value: string, patterns: ParsedPatterns, lang: 'hebraic' | 'geez' | 'greek', listenUpdate: number): string {
    listenUpdate;
    const literals = lang === 'hebraic' ? this.literalsStorage.getHebraicLexical() : this.literalsStorage.getGeezLexical();

    return value.split(' ').map(sentence => {
      let literalWord: string[] = [];
      for (let word of this.literalsPatternsService.splitByPatterns(patterns, sentence)) {
        literalWord.push(literals[word]);
      }

      return literalWord.join(' ');
    }).join(' ');
  }

}
