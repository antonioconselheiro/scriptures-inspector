import { Injectable } from '@angular/core';
import { Language } from '@domain/language-model';
import { PatternsSerialized } from '@domain/patterns-serialized-model';
import { SegmentationChanges } from './translation-editor/shared/segmentation-changes';

@Injectable({
  providedIn: 'root',
})
export class PatternsService {
  constructor(private segmentationChanges: SegmentationChanges) {}

  addPattern(patterns: PatternsSerialized, type: 'prefix' | 'suffix' | 'lexeme', language: Language, word: string): void {
    const normalized = language.normalizeFn ? language.normalizeFn(word) : word;
    patterns.distinct ??= {};
    if (!patterns[type].includes(normalized)) {
      patterns[type].push(normalized);
      this.segmentationChanges.patternsChanged();
    }
  }

  deletePattern(patterns: PatternsSerialized, type: 'prefix' | 'suffix' | 'lexeme', index: number): void {
    patterns[type].splice(index, 1);
    this.segmentationChanges.patternsChanged();
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
    this.segmentationChanges.patternsChanged();
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
    this.segmentationChanges.patternsChanged();
  }
}
