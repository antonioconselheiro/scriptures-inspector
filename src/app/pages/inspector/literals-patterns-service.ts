import { Injectable } from '@angular/core';
import { PatternsParsed } from './patterns-parsed';

@Injectable({
  providedIn: 'root'
})
export class LiteralsPatternsService {
  
  splitByPatterns(patterns: PatternsParsed, hebraic: string): string[] {
    let matchPrefix = '',
      matchSuffix = '';

    for (let [prefix, pattern] of patterns.prefix) {
      if (pattern.test(hebraic)) {
        matchPrefix = prefix;
        hebraic = hebraic.replace(pattern, '');
        break;
      }
    }

    for (let [suffix, pattern] of patterns.suffix) {
      if (pattern.test(hebraic)) {
        matchSuffix = suffix;
        hebraic = hebraic.replace(pattern, '');
        break;
      }
    }

    let words: string[] = [];
    if (matchPrefix && matchSuffix) {
      words = [matchPrefix, ...this.splitByPatterns(patterns, hebraic), matchSuffix];
    } else if (matchPrefix) {
      words = [matchPrefix, ...this.splitByPatterns(patterns, hebraic)];
    } else if (matchSuffix) {
      words = [...this.splitByPatterns(patterns, hebraic), matchSuffix];
    } else {
      words = [hebraic];
    }

    return words.filter(word => word);
  }
}
