import { Injectable } from '@angular/core';
import { ParsedPatterns } from './parsed-patterns';

@Injectable({
  providedIn: 'root'
})
export class LiteralsPatternsService {
  
  splitByPatterns(patterns: ParsedPatterns, pharse: string): string[] {
    return pharse.split(' ').map(word => {
      let matchPrefix = '',
        matchSuffix = '';
  
      for (let [prefix, pattern] of patterns.prefix) {
        if (pattern.test(word)) {
          matchPrefix = prefix;
          word = word.replace(pattern, '');
          break;
        }
      }
  
      for (let [suffix, pattern] of patterns.suffix) {
        if (pattern.test(word)) {
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
