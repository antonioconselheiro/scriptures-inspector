import { Injectable } from '@angular/core';
import { PatternsParsed } from './patterns-parsed';
import { PatternsSerialized } from './patterns-serialized';

@Injectable({
  providedIn: 'root'
})
export class LiteralsStorage {

  private hebraicLiterals: Record<string, string> = {};
  private hebraicPatterns: PatternsSerialized = { prefix: [], suffix: [] };

  private geezLiterals: Record<string, string> = {};
  private geezPatterns: PatternsSerialized = { prefix: [], suffix: [] };

  constructor() {
    try {
      this.hebraicLiterals = JSON.parse(localStorage.getItem('literals') || '{}');
      this.hebraicPatterns = JSON.parse(localStorage.getItem('patterns') || JSON.stringify(this.hebraicPatterns));

      this.geezLiterals = JSON.parse(localStorage.getItem('geezLiterals') || '{}');
      this.geezPatterns = JSON.parse(localStorage.getItem('geezPatterns') || JSON.stringify(this.geezPatterns));
    } catch (e) {
      console.error(e);
    }
  }

  getHebraicLiteral(): Record<string, string> {
    return this.hebraicLiterals;
  }

  getGeezLiteral(): Record<string, string> {
    return this.geezLiterals;
  }

  addHebraicLiteral(hebrew: string, literal: string): void {
    this.hebraicLiterals[hebrew] = literal;
    localStorage.setItem('literals', JSON.stringify(this.hebraicLiterals));
  }

  addGeezLiteral(geez: string, literal: string): void {
    this.geezLiterals[geez] = literal;
    localStorage.setItem('geezLiterals', JSON.stringify(this.geezLiterals));
  }

  getHebraicPattern(): PatternsParsed {
    return this.getPattern(this.hebraicPatterns);
  }

  getGeezPattern(): PatternsParsed {
    return this.getPattern(this.geezPatterns);
  }

  private getPattern(fromPatterns: PatternsSerialized) {
    let prefix = new Array<{ word: string; pattern: RegExp }>,
      suffix = new Array<{ word: string; pattern: RegExp }>;

    prefix = fromPatterns.prefix.map(pattern => {
      return {
        pattern: new RegExp(`^${pattern}`),
        word: pattern
      };
    });

    suffix = fromPatterns.suffix.map(pattern => {
      return {
        pattern: new RegExp(`${pattern}$`),
        word: pattern
      };
    });

    return { prefix, suffix }
  }

  addHebraicPattern(word: string, type: 'prefix' | 'suffix'): PatternsParsed {
    return this.addPattern(this.hebraicPatterns, 'patterns', word, type);
  }

  addGeezPattern(word: string, type: 'prefix' | 'suffix'): PatternsParsed {
    return this.addPattern(this.geezPatterns, 'geezPatterns', word, type);
  }

  private addPattern(serialized: PatternsSerialized, storageKey: string, word: string, type: 'prefix' | 'suffix'): PatternsParsed {
    const index = serialized[type].findIndex(pattern => pattern.length <= word.length);
    serialized[type].splice(index, 0, word);
    localStorage.setItem(storageKey, JSON.stringify(serialized));

    return this.getHebraicPattern();
  }

  deleteHebraicPattern(type: 'prefix' | 'suffix', index: number): PatternsParsed {
    return this.deletePattern('patterns', type, index);
  }

  deleteGeezPattern(type: 'prefix' | 'suffix', index: number): PatternsParsed {
    return this.deletePattern('geezPatterns', type, index);
  }

  private deletePattern(storageKey: string, type: 'prefix' | 'suffix', index: number): PatternsParsed {
    this.hebraicPatterns[type].splice(index, 1);
    localStorage.setItem(storageKey, JSON.stringify(this.hebraicPatterns));
    return this.getHebraicPattern();
  }
}
