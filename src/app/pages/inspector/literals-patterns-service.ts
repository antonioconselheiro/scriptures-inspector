import { Injectable } from '@angular/core';
import { ParsedPatterns } from '../../domain/parsed-patterns';

@Injectable({
  providedIn: 'root'
})
export class LiteralsPatternsService {

  splitByPatterns(patterns: ParsedPatterns, pharse: string): string[] {
    return pharse.split(' ').map(word => {
      let matchPrefix = '',
        matchSuffix = '';

      for (let [, pattern] of patterns.prefix) {
        const match = word.match(pattern);
        if (match) {
          const [prefix] = Array.from(match);
          matchPrefix = prefix;
          word = word.replace(pattern, '');
          break;
        }
      }

      for (let [, pattern] of patterns.suffix) {
        const match = word.match(pattern);
        if (match) {
          const [suffix] = Array.from(match);
          matchSuffix = suffix;
          word = word.replace(pattern, '');
          break;
        }
      }

      let words: string[] = [];
      if (matchPrefix && matchSuffix) {
        words = [matchPrefix, ...this.splitByPatterns(patterns, word), matchSuffix];
      } else if (matchPrefix) {
        words = [matchPrefix, ...this.splitByPatterns(patterns, word)];
      } else if (matchSuffix) {
        words = [...this.splitByPatterns(patterns, word), matchSuffix];
      } else {
        words = [word];
      }

      return words.filter(word => word);
    }).flat();
  }
}
