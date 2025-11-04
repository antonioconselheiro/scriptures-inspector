import { Pipe, PipeTransform } from '@angular/core';
import { LiteralsStorage } from './literals-storage';
import { LiteralsPatternsService } from './literals-patterns-service';
import { PatternsParsed } from './patterns-parsed';

@Pipe({
  name: 'literalizate'
})
export class LiteralizatePipe implements PipeTransform {

  constructor(
    private literalsStorage: LiteralsStorage,
    private literalsPatternsService: LiteralsPatternsService
  ) { }

  transform(value: string, patterns: PatternsParsed, lang: 'hebraic' | 'geez' | 'greek', listenUpdate: number): string {
    listenUpdate;
    const literals = lang === 'hebraic' ? this.literalsStorage.getHebraicLiteral() : this.literalsStorage.getGeezLiteral();

    return value.split(' ').map(sentence => {
      let literalWord: string[] = [];
      for (let word of this.literalsPatternsService.splitByPatterns(patterns, sentence)) {
        literalWord.push(literals[word]);
      }

      return literalWord.join(' ');
    }).join(' ').replace(/( ')/g, '\'');
  }

}
