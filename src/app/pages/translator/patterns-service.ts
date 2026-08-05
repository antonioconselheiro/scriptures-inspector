import { Injectable } from '@angular/core';
import { Language } from '@domain/language-model';
import { PatternsSerialized } from '@domain/patterns-serialized';

@Injectable({
  providedIn: 'root',
})
export class PatternsService {
  addPattern(patterns: PatternsSerialized, type: 'prefix' | 'suffix' | 'lexeme', language: Language, word: string): void {
    const normalized = language.normalizeFn ? language.normalizeFn(word) : word;
    if (!patterns[type].includes(normalized)) {
      patterns[type].push(normalized);
    }
  }

  deletePattern(patterns: PatternsSerialized, type: 'prefix' | 'suffix' | 'lexeme', index: number): void {
    patterns[type].splice(index, 1);
  }
}
