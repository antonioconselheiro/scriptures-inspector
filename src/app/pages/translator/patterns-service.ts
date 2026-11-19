import { Injectable } from '@angular/core';
import { Language } from '@domain/language-model';
import { PatternsSerialized } from '@domain/patterns-serialized-model';

@Injectable({
  providedIn: 'root',
})
export class PatternsService {
  addPattern(patterns: PatternsSerialized, type: 'prefix' | 'suffix' | 'lexeme', language: Language, word: string): void {
    const normalized = language.normalizeFn ? language.normalizeFn(word) : word;
    patterns.distinct ??= {};
    if (!patterns[type].includes(normalized)) {
      patterns[type].push(normalized);
    }
  }

  deletePattern(patterns: PatternsSerialized, type: 'prefix' | 'suffix' | 'lexeme', index: number): void {
    patterns[type].splice(index, 1);
  }

  addDistinctPattern(
    patterns: PatternsSerialized,
    type: 'prefix' | 'suffix',
    language: Language,
    segment: string,
    word: string
  ): void {
    const normalize = language.normalizeFn ?? ((value: string) => value);
    const normalizedSegment = normalize(segment);
    const normalizedWord = normalize(word);
    const matches = type === 'prefix'
      ? normalizedSegment.startsWith(normalizedWord)
      : normalizedSegment.endsWith(normalizedWord);
    if (!normalizedSegment || !normalizedWord || normalizedWord.length >= normalizedSegment.length || !matches) {
      throw new Error(`Cannot define ${word} as a distinct ${type} for ${segment}`);
    }

    patterns.distinct ??= {};
    const existingKey = Object.keys(patterns.distinct)
      .find(key => normalize(key) === normalizedSegment);
    const key = existingKey ?? segment;
    patterns.distinct[key] ??= {};
    patterns.distinct[key][type] = normalizedWord;
  }

  deleteDistinctPattern(
    patterns: PatternsSerialized,
    segment: string,
    type: 'prefix' | 'suffix'
  ): void {
    const distinct = patterns.distinct;
    const pattern = distinct?.[segment];
    if (!pattern) {
      return;
    }

    delete pattern[type];
    if (Object.keys(pattern).length === 0) {
      delete distinct[segment];
    }
  }
}
