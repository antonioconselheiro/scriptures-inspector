import { Injectable } from '@angular/core';
import { AbstractHolyScriptureModel } from './domain/abstract-holy-scripture-model';
import { InterlinearGeezGreek } from './domain/interlinear-geez-greek-model';
import { InterlinearGeezHebraic } from './domain/interlinear-geez-hebraic-model';
import { ParsedPatterns } from './parsed-patterns';
import { PatternsSerialized } from './patterns-serialized';
import { NewTestamentBooksUnion } from '../../domain/new-testament-books-union';
import { OldTestamentBooksUnion } from '../../domain/old-testament-books-union';
import { AbstractCodice } from './domain/abstract-codice-model';
import { AbstractScriptureVerse } from './domain/abstract-scripture-verse-model';
import { ScriptureVerseMetadata } from './domain/scripture-verse-metadata-model';
import { createNewTestmentObjectBase } from './create-new-testment-fn';
import { createOldTestmentObjectBase } from './create-old-testment-fn';

@Injectable({
  providedIn: 'root'
})
export class DocumentStorage {

  private hebraicMetadata: AbstractCodice<OldTestamentBooksUnion, AbstractScriptureVerse<ScriptureVerseMetadata>> = {
    ...createOldTestmentObjectBase()
  };
  private hebraicLexical: Record<string, string> = {};
  private hebraicPatterns: PatternsSerialized = { prefix: [], suffix: [] };

  private greekMetadata: AbstractCodice<NewTestamentBooksUnion, AbstractScriptureVerse<ScriptureVerseMetadata>> = {
    ...createNewTestmentObjectBase()
  };
  private geezLexical: Record<string, string> = {};
  private geezPatterns: PatternsSerialized = { prefix: [], suffix: [] };

  private geezMetadata: AbstractCodice<OldTestamentBooksUnion | NewTestamentBooksUnion, AbstractScriptureVerse<ScriptureVerseMetadata>> = {
    ...createOldTestmentObjectBase(),
    ...createNewTestmentObjectBase()
  };
  private greekLexical: Record<string, string> = {};
  private greekPatterns: PatternsSerialized = { prefix: [], suffix: [] };

  private interlinearGeezHebraic: InterlinearGeezHebraic = ({} as any);
  private interlinearGeezGreek: InterlinearGeezGreek = ({} as any);

  constructor() {
    try {
      this.hebraicMetadata = JSON.parse(localStorage.getItem('hebraicMetadata') || '{}');
      this.hebraicLexical = JSON.parse(localStorage.getItem('hebraicLexical') || '{}');
      this.hebraicPatterns = JSON.parse(localStorage.getItem('hebraicPatterns') || JSON.stringify(this.hebraicPatterns));

      this.greekMetadata = JSON.parse(localStorage.getItem('greekMetadata') || '{}');
      this.greekLexical = JSON.parse(localStorage.getItem('greekLexical') || '{}');
      this.greekPatterns = JSON.parse(localStorage.getItem('greekPatterns') || JSON.stringify(this.greekPatterns));

      this.geezMetadata = JSON.parse(localStorage.getItem('geezMetadata') || '{}');
      this.geezLexical = JSON.parse(localStorage.getItem('geezLexical') || '{}');
      this.geezPatterns = JSON.parse(localStorage.getItem('geezPatterns') || JSON.stringify(this.geezPatterns));

      this.interlinearGeezHebraic = JSON.parse(localStorage.getItem('interlinearGeezHebraic') || JSON.stringify(this.interlinearGeezHebraic));
      this.interlinearGeezGreek = JSON.parse(localStorage.getItem('interlinearGeezGreek') || JSON.stringify(this.interlinearGeezGreek));
    } catch (e) {
      console.error(e);
    }
  }

  getHebraicLexical(): Record<string, string> {
    return this.hebraicLexical;
  }

  getGeezLexical(): Record<string, string> {
    return this.geezLexical;
  }

  getGreekLexical(): Record<string, string> {
    return this.greekLexical;
  }

  addHebraicLexical(hebrew: string, lexical: string): void {
    this.hebraicLexical[hebrew] = lexical;
    localStorage.setItem('hebraicLexical', JSON.stringify(this.hebraicLexical));
  }

  addGeezLexical(geez: string, lexical: string): void {
    this.geezLexical[geez] = lexical;
    localStorage.setItem('geezLexical', JSON.stringify(this.geezLexical));
  }

  addGreekLexical(greek: string, lexical: string): void {
    this.greekLexical[greek] = lexical;
    localStorage.setItem('greekLexical', JSON.stringify(this.greekLexical));
  }

  getHebraicMetadata(): AbstractCodice<OldTestamentBooksUnion, AbstractScriptureVerse<ScriptureVerseMetadata>> {
    return this.hebraicMetadata;
  }

  getGreekMetadata(): AbstractCodice<NewTestamentBooksUnion, AbstractScriptureVerse<ScriptureVerseMetadata>> {
    return this.greekMetadata;
  }

  getGeezMetadata(): AbstractCodice<OldTestamentBooksUnion | NewTestamentBooksUnion, AbstractScriptureVerse<ScriptureVerseMetadata>> {
    return this.geezMetadata;
  }

  saveHebraicMetadata(metadata: AbstractCodice<OldTestamentBooksUnion, AbstractScriptureVerse<ScriptureVerseMetadata>>): void {
    localStorage.setItem('hebraicMetadata', JSON.stringify(metadata));
  }

  saveGreekMetadata(metadata: AbstractCodice<NewTestamentBooksUnion, AbstractScriptureVerse<ScriptureVerseMetadata>>): void {
    localStorage.setItem('greekMetadata', JSON.stringify(metadata));
  }

  saveGeezMetadata(metadata: AbstractCodice<OldTestamentBooksUnion | NewTestamentBooksUnion, AbstractScriptureVerse<ScriptureVerseMetadata>>): void {
    localStorage.setItem('geezMetadata', JSON.stringify(metadata));
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

  getGreekPattern(): ParsedPatterns {
    return this.getPattern(this.greekPatterns);
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

  addGreekPattern(word: string, type: 'prefix' | 'suffix'): ParsedPatterns {
    return this.addPattern(this.greekPatterns, 'greekPatterns', word, type);
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

  deleteGreekPattern(type: 'prefix' | 'suffix', index: number): ParsedPatterns {
    return this.deletePattern('greekPatterns', type, this.greekPatterns, index);
  }

  private deletePattern(storageKey: string, type: 'prefix' | 'suffix', patterns: PatternsSerialized, index: number): ParsedPatterns {
    patterns[type].splice(index, 1);
    localStorage.setItem(storageKey, JSON.stringify(patterns));
    return this.getHebraicPattern();
  }
}
