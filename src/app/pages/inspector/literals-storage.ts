import { Injectable } from '@angular/core';
import { AbstractHolyScriptureModel } from './domain/abstract-holy-scripture-model';
import { InterlinearGeezGreek } from './domain/interlinear-geez-greek-model';
import { InterlinearGeezHebraic } from './domain/interlinear-geez-hebraic-model';
import { ParsedPatterns } from './parsed-patterns';
import { PatternsSerialized } from './patterns-serialized';

@Injectable({
  providedIn: 'root'
})
export class LiteralsStorage {

  private hebraicLiterals: Record<string, string> = {};
  private hebraicPatterns: PatternsSerialized = { prefix: [], suffix: [] };

  private geezLiterals: Record<string, string> = {};
  private geezPatterns: PatternsSerialized = { prefix: [], suffix: [] };

  private interlinearGeezHebraic: InterlinearGeezHebraic = ({} as any);
  private interlinearGeezGreek: InterlinearGeezGreek = ({} as any);

  constructor() {
    try {
      this.hebraicLiterals = JSON.parse(localStorage.getItem('hebraicLiterals') || '{}');
      this.hebraicPatterns = JSON.parse(localStorage.getItem('hebraicPatterns') || JSON.stringify(this.hebraicPatterns));

      this.geezLiterals = JSON.parse(localStorage.getItem('geezLiterals') || '{}');
      this.geezPatterns = JSON.parse(localStorage.getItem('geezPatterns') || JSON.stringify(this.geezPatterns));

      this.interlinearGeezHebraic = JSON.parse(localStorage.getItem('interlinearGeezHebraic') || JSON.stringify(this.interlinearGeezHebraic));
      this.interlinearGeezGreek = JSON.parse(localStorage.getItem('interlinearGeezGreek') || JSON.stringify(this.interlinearGeezGreek));
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
    localStorage.setItem('hebraicLiterals', JSON.stringify(this.hebraicLiterals));
  }

  addGeezLiteral(geez: string, literal: string): void {
    this.geezLiterals[geez] = literal;
    localStorage.setItem('geezLiterals', JSON.stringify(this.geezLiterals));
  }

  saveHebraicCustomTranslation(customTranslation: AbstractHolyScriptureModel): void {
    localStorage.setItem('customHebraicTranslation', JSON.stringify(customTranslation));
  }

  saveGeezCustomTranslation(customTranslation: AbstractHolyScriptureModel): void {
    localStorage.setItem('customGeezTranslation', JSON.stringify(customTranslation));
  }

  saveGreekCustomTranslation(customTranslation: AbstractHolyScriptureModel): void {
    localStorage.setItem('customGreekTranslation', JSON.stringify(customTranslation));
  }

  getHebraicPattern(): ParsedPatterns {
    return this.getPattern(this.hebraicPatterns);
  }

  getGeezPattern(): ParsedPatterns {
    return this.getPattern(this.geezPatterns);
  }

  private getPattern(fromPatterns: PatternsSerialized) {
    let prefix = new Map<string, RegExp>(fromPatterns.prefix.map(pattern => [pattern, new RegExp(`^${pattern}`)]));
    let suffix = new Map<string, RegExp>(fromPatterns.suffix.map(pattern => [pattern, new RegExp(`${pattern}$`)]));

    return { prefix, suffix }
  }

  addHebraicPattern(word: string, type: 'prefix' | 'suffix'): ParsedPatterns {
    return this.addPattern(this.hebraicPatterns, 'hebraicPatterns', word, type);
  }

  addGeezPattern(word: string, type: 'prefix' | 'suffix'): ParsedPatterns {
    return this.addPattern(this.geezPatterns, 'geezPatterns', word, type);
  }

  private addPattern(serialized: PatternsSerialized, storageKey: string, word: string, type: 'prefix' | 'suffix'): ParsedPatterns {
    const empty = -1;
    if (serialized[type].indexOf(word) !== empty) {
      return this.getPattern(serialized);
    }

    const index = serialized[type].findIndex(pattern => pattern.length <= word.length);
    serialized[type].splice(index, 0, word);
    localStorage.setItem(storageKey, JSON.stringify(serialized));

    return this.getPattern(serialized);
  }

  deleteHebraicPattern(type: 'prefix' | 'suffix', index: number): ParsedPatterns {
    return this.deletePattern('hebraicPatterns', type, this.hebraicPatterns, index);
  }

  deleteGeezPattern(type: 'prefix' | 'suffix', index: number): ParsedPatterns {
    return this.deletePattern('geezPatterns', type, this.geezPatterns, index);
  }

  private deletePattern(storageKey: string, type: 'prefix' | 'suffix', patterns: PatternsSerialized, index: number): ParsedPatterns {
    patterns[type].splice(index, 1);
    localStorage.setItem(storageKey, JSON.stringify(patterns));
    return this.getHebraicPattern();
  }
}
