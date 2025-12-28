import { Injectable } from '@angular/core';
import { NewTestamentBooksUnion } from '../../domain/new-testament-books-union';
import { OldTestamentBooksUnion } from '../../domain/old-testament-books-union';
import { createNewTestmentObjectBase } from './create-new-testment-fn';
import { createOldTestmentObjectBase } from './create-old-testment-fn';
import { Codex } from '../../domain/codex-model';
import { CodexBookChapterVerse } from '../../domain/codex-book-chapter-verse-model';
import { HolyScriptureModel } from './domain/holy-scripture-model';
import { InterlinearGeezGreek } from './domain/interlinear-geez-greek-model';
import { InterlinearGeezHebraic } from './domain/interlinear-geez-hebraic-model';
import { NewTestmentScriptures } from './domain/new-testment-scriptures-model';
import { OldTestmentScriptures } from './domain/old-testment-scriptures-model';
import { CodexBookChapterVerseMetadata } from '../../domain/codex-book-chapter-verse-metadata-model';
import { ParsedPatterns } from '../../domain/parsed-patterns';
import { PatternsSerialized } from '../../domain/patterns-serialized';

@Injectable({
  providedIn: 'root'
})
export class DocumentStorage {

  private hebraicMetadata: Codex<OldTestamentBooksUnion, CodexBookChapterVerse<CodexBookChapterVerseMetadata>> = {
    ...createOldTestmentObjectBase()
  };
  private hebraicLexical: Record<string, string> = {};
  private hebraicPatterns: PatternsSerialized = { prefix: [], suffix: [] };

  private greekMetadata: Codex<NewTestamentBooksUnion, CodexBookChapterVerse<CodexBookChapterVerseMetadata>> = {
    ...createNewTestmentObjectBase()
  };
  private geezLexical: Record<string, string> = {};
  private geezPatterns: PatternsSerialized = { prefix: [], suffix: [] };

  private greekLexical: Record<string, string> = {};
  private greekPatterns: PatternsSerialized = { prefix: [], suffix: [] };

  private customHebraicTranslation!: OldTestmentScriptures<{ metadata?: string[] }>;
  private customGreekTranslation!: NewTestmentScriptures<{ metadata?: string[] }>;
  private customGeezTranslation!: HolyScriptureModel<{ metadata?: string[] }>;

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

      this.geezLexical = JSON.parse(localStorage.getItem('geezLexical') || '{}');
      this.geezPatterns = JSON.parse(localStorage.getItem('geezPatterns') || JSON.stringify(this.geezPatterns));

      this.interlinearGeezHebraic = JSON.parse(localStorage.getItem('interlinearGeezHebraic') || JSON.stringify(this.interlinearGeezHebraic));
      this.interlinearGeezGreek = JSON.parse(localStorage.getItem('interlinearGeezGreek') || JSON.stringify(this.interlinearGeezGreek));

      this.customHebraicTranslation = this.readCustomHebraicTranslation();
      this.customGreekTranslation = this.readCustomGreekTranslation();
      this.customGeezTranslation = this.readCustomGeezTranslation();
    } catch (e) {
      console.error(e);
    }
  }

  private readCustomHebraicTranslation(): OldTestmentScriptures {
    const storedCustomHebraicTranslation = localStorage.getItem('customHebraicTranslation');
    if (storedCustomHebraicTranslation) {
      try {
        return JSON.parse(storedCustomHebraicTranslation);
      } catch {
        return {
          ...createOldTestmentObjectBase()
        };
      }
    } else {
      return {
        ...createOldTestmentObjectBase()
      };
    }
  }

  private readCustomGeezTranslation(): HolyScriptureModel {
    const storedCustomGeezTranslation = localStorage.getItem('customGeezTranslation');
    if (storedCustomGeezTranslation) {
      try {
        return JSON.parse(storedCustomGeezTranslation);
      } catch {
        return {
          ...createOldTestmentObjectBase(),
          ...createNewTestmentObjectBase()
        };
      }
    } else {
      return {
        ...createOldTestmentObjectBase(),
        ...createNewTestmentObjectBase()
      };
    }
  }

  private readCustomGreekTranslation(): NewTestmentScriptures {
    const storedCustomGreekTranslation = localStorage.getItem('customGreekTranslation');
    if (storedCustomGreekTranslation) {
      try {
        return JSON.parse(storedCustomGreekTranslation);
      } catch {
        return { ...createNewTestmentObjectBase() };
      }
    } else {
      return { ...createNewTestmentObjectBase() };
    }
  }

  getHebraicLexical(): Record<string, string> {
    return this.hebraicLexical;
  }

  getGreekLexical(): Record<string, string> {
    return this.greekLexical;
  }

  getGeezLexical(): Record<string, string> {
    return this.geezLexical;
  }

  addHebraicLexical(hebrew: string, lexical: string): void {
    this.hebraicLexical[hebrew] = lexical;
    localStorage.setItem('hebraicLexical', JSON.stringify(this.hebraicLexical));
  }

  addGreekLexical(greek: string, lexical: string): void {
    this.greekLexical[greek] = lexical;
    localStorage.setItem('greekLexical', JSON.stringify(this.greekLexical));
  }

  addGeezLexical(geez: string, lexical: string): void {
    this.geezLexical[geez] = lexical;
    localStorage.setItem('geezLexical', JSON.stringify(this.geezLexical));
  }

  removeHebraicLexical(word: string): void {
    delete this.hebraicLexical[word];
    localStorage.setItem('hebraicLexical', JSON.stringify(this.hebraicLexical));
  }
  removeGreekLexical(word: string): void {
    delete this.greekLexical[word];
    localStorage.setItem('greekLexical', JSON.stringify(this.greekLexical));
  }

  removeGeezLexical(word: string): void {
    delete this.geezLexical[word];
    localStorage.setItem('geezLexical', JSON.stringify(this.geezLexical));
  }

  getHebraicMetadata(): Codex<OldTestamentBooksUnion, CodexBookChapterVerse<CodexBookChapterVerseMetadata>> {
    return this.hebraicMetadata;
  }

  getGreekMetadata(): Codex<NewTestamentBooksUnion, CodexBookChapterVerse<CodexBookChapterVerseMetadata>> {
    return this.greekMetadata;
  }

  saveHebraicMetadata(metadata: Codex<OldTestamentBooksUnion, CodexBookChapterVerse<CodexBookChapterVerseMetadata>>): void {
    this.hebraicMetadata = metadata;
    localStorage.setItem('hebraicMetadata', JSON.stringify(metadata));
  }

  saveGreekMetadata(metadata: Codex<NewTestamentBooksUnion, CodexBookChapterVerse<CodexBookChapterVerseMetadata>>): void {
    this.greekMetadata = metadata;
    localStorage.setItem('greekMetadata', JSON.stringify(metadata));
  }

  getCustomHebraicTranslation(): OldTestmentScriptures<{ metadata?: string[] }> {
    return this.customHebraicTranslation;
  }

  getCustomGreekTranslation(): NewTestmentScriptures<{ metadata?: string[] }> {
    return this.customGreekTranslation;
  }

  getCustomGeezTranslation(): HolyScriptureModel<{ metadata?: string[] }> {
    return this.customGeezTranslation;
  }

  saveHebraicCustomTranslation(customTranslation: OldTestmentScriptures<{ metadata?: string[] }>): void {
    this.customHebraicTranslation = customTranslation;
    localStorage.setItem('customHebraicTranslation', JSON.stringify(this.customHebraicTranslation));
  }

  saveGreekCustomTranslation(customTranslation: NewTestmentScriptures<{ metadata?: string[] }>): void {
    this.customGreekTranslation = customTranslation;
    localStorage.setItem('customGreekTranslation', JSON.stringify(this.customGreekTranslation));
  }

  saveGeezCustomTranslation(customTranslation: HolyScriptureModel<{ metadata?: string[] }>): void {
    this.customGeezTranslation = customTranslation;
    localStorage.setItem('customGeezTranslation', JSON.stringify(this.customGeezTranslation));
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

  private massoretifier(pattern: string): string {
    return pattern.replace(
      /([\p{Script=Hebrew}])/gu,
      '$1\\p{M}*'
    );
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

  getInterlinearGeezHebraic(): InterlinearGeezHebraic {
    return this.interlinearGeezHebraic;
  }

  getInterlinearGeezGreek(): InterlinearGeezGreek {
    return this.interlinearGeezGreek;
  }

  saveInterlinearGeezHebraic(interlinear: InterlinearGeezHebraic): InterlinearGeezHebraic {
    this.interlinearGeezHebraic = interlinear;
    localStorage.setItem('interlinearGeezHebraic', JSON.stringify(this.interlinearGeezHebraic));
    return this.interlinearGeezHebraic;
  }

  saveInterlinearGeezGreek(interlinear: InterlinearGeezGreek): InterlinearGeezGreek {
    this.interlinearGeezGreek = interlinear;
    localStorage.setItem('interlinearGeezGreek', JSON.stringify(this.interlinearGeezGreek));
    return this.interlinearGeezGreek;
  }
}
