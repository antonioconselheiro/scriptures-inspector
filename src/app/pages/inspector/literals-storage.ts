import { Injectable } from '@angular/core';
import { PatternsParsed } from './patterns-parsed';
import { PatternsSerialized } from './patterns-serialized';

@Injectable({
  providedIn: 'root'
})
export class LiteralsStorage {

  private literals: Record<string, string> = {};
  private patterns: PatternsSerialized = { prefix: [], suffix: [] };

  constructor() {
    try {
      this.literals = JSON.parse(localStorage.getItem('literals') || '{}');
      this.patterns = JSON.parse(localStorage.getItem('patterns') || JSON.stringify(this.patterns));
    } catch (e) {
      console.error(e);
    }
  }

  getLiteral(): Record<string, string> {
    return this.literals;
  }

  addLiteral(hebrew: string, literal: string): void {
    this.literals[hebrew] = literal;
    localStorage.setItem('literals', JSON.stringify(this.literals));
  }

  getPattern(): PatternsParsed {
    let prefix = new Array<{ word: string; pattern: RegExp }>,
      suffix = new Array<{ word: string; pattern: RegExp }>;

    prefix = this.patterns.prefix.map(pattern => {
      return {
        pattern: new RegExp(`^${pattern}`),
        word: pattern
      };
    });

    suffix = this.patterns.suffix.map(pattern => {
      return {
        pattern: new RegExp(`${pattern}$`),
        word: pattern
      };
    });

    return { prefix, suffix }
  }

  addPattern(word: string, type: 'prefix' | 'suffix'): PatternsParsed {
    const index = this.patterns[type].findIndex(pattern => pattern.length <= word.length);
    this.patterns[type].splice(index, 0, word);
    localStorage.setItem('patterns', JSON.stringify(this.patterns));

    return this.getPattern();
  }

  deletePattern(type: 'prefix' | 'suffix', index: number): PatternsParsed {
    this.patterns[type].splice(index, 1);
    localStorage.setItem('pattern', JSON.stringify(this.patterns));
    return this.getPattern();
  }
}
