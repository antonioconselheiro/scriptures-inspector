import { Injectable } from '@angular/core';
import { PatternsParsed } from './patterns-parsed';

@Injectable({
  providedIn: 'root'
})
export class LiteralsPatternsService {
  
  splitByPatterns(patterns: PatternsParsed, hebraic: string): string[] {
    let matchPrefix = '',
      matchSuffix = '';

    for (let prefix of patterns.prefix) {
      if (prefix.pattern.test(hebraic)) {
        matchPrefix = prefix.word;
        hebraic = hebraic.replace(prefix.pattern, '');
        break;
      }
    }

    for (let suffix of patterns.suffix) {
      if (suffix.pattern.test(hebraic)) {
        matchSuffix = suffix.word;
        hebraic = hebraic.replace(suffix.pattern, '');
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
