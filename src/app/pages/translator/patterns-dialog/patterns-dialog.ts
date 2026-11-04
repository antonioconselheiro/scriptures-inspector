
import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { Language } from '@domain/language-model';
import { PatternsSerialized } from '@domain/patterns-serialized-model';
import { languageMetadataRecord } from '@shared/language-metadata/language-metadata-record';
import { Subject } from 'rxjs';
import { PatternsService } from '../patterns-service';

type PatternSortField = 'insertion' | 'type' | 'pattern';
type PatternSortOrder =
  | 'insertion-asc'
  | 'insertion-desc'
  | 'alphabetical-asc'
  | 'alphabetical-desc'
  | 'length-asc'
  | 'length-desc'
  | 'prefix-first'
  | 'suffix-first'
  | 'lexeme-first';

@Component({
  selector: 'app-patterns-dialog',
  imports: [
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './patterns-dialog.html',
  styleUrl: './patterns-dialog.scss'
})
export class PatternsDialog extends ModalableDirective<{ language: string, patterns: PatternsSerialized }, PatternsSerialized> {

  readonly indexNotFound = -1;
  languageMetadataRecord: Record<string, Language> = languageMetadataRecord;
  @Input() patterns!: PatternsSerialized;
  @Input() language!: string;
  sortedPatterns: Array<{ type: 'prefix' | 'suffix' | 'lexeme'; pattern: string; index: number }> = [];
  sortBy: PatternSortField = 'insertion';
  sortOrder: PatternSortOrder = 'insertion-asc';
  readonly sortOrderOptions: Record<PatternSortField, Array<{ value: PatternSortOrder; label: string }>> = {
    insertion: [
      { value: 'insertion-asc', label: 'Insertion order' },
      { value: 'insertion-desc', label: 'Reverse insertion order' }
    ],
    type: [
      { value: 'prefix-first', label: 'Prefix first' },
      { value: 'suffix-first', label: 'Suffix first' },
      { value: 'lexeme-first', label: 'Lexeme first' }
    ],
    pattern: [
      { value: 'alphabetical-asc', label: 'Alphabetical (A–Z)' },
      { value: 'alphabetical-desc', label: 'Alphabetical (Z–A)' },
      { value: 'length-asc', label: 'Shortest first' },
      { value: 'length-desc', label: 'Longest first' }
    ]
  };
  form: FormGroup<any>;

  override response = new Subject<PatternsSerialized | void>();
  private readonly collator = new Intl.Collator(undefined, {
    usage: 'sort',
    sensitivity: 'base',
    numeric: true
  });

  constructor(
    fb: FormBuilder,
    private patternsService: PatternsService
  ) {
    super();
    this.form = fb.group({
      word: ['', [Validators.required]],
      type: ['prefix', [Validators.required]]
    });
  }

  override onInjectData(data: { language: string, patterns: PatternsSerialized }): void {
    this.patterns = data.patterns;
    this.language = data.language;
    this.sortPatterns();
  }

  onSortByChange(sortBy: PatternSortField): void {
    this.sortBy = sortBy;
    this.sortOrder = sortBy === 'insertion'
      ? 'insertion-asc'
      : sortBy === 'type'
        ? 'prefix-first'
        : 'alphabetical-asc';
    this.sortPatterns();
  }

  sortPatterns(): void {
    const patterns = (['prefix', 'suffix', 'lexeme'] as const).flatMap(type =>
      this.patterns[type].map((pattern, index) => ({ type, pattern, index }))
    );

    if (this.sortBy === 'insertion') {
      this.sortedPatterns = this.sortOrder === 'insertion-desc' ? patterns.reverse() : patterns;
      return;
    }

    if (this.sortBy === 'type') {
      const priority = this.sortOrder === 'suffix-first'
        ? { suffix: 0, prefix: 1, lexeme: 2 }
        : this.sortOrder === 'lexeme-first'
          ? { lexeme: 0, prefix: 1, suffix: 2 }
          : { prefix: 0, suffix: 1, lexeme: 2 };
      this.sortedPatterns = patterns.sort((a, b) => priority[a.type] - priority[b.type]);
      return;
    }

    const descending = this.sortOrder === 'alphabetical-desc';
    const byLength = this.sortOrder === 'length-asc' || this.sortOrder === 'length-desc';
    const lengthDirection = this.sortOrder === 'length-desc' ? -1 : 1;
    this.sortedPatterns = patterns.sort((a, b) => {
      if (byLength) {
        const lengthDifference = Array.from(a.pattern).length - Array.from(b.pattern).length;
        if (lengthDifference) {
          return lengthDifference * lengthDirection;
        }
      }

      const alphabeticalDifference = this.collator.compare(
        this.alphabeticCharactersOnly(a.pattern),
        this.alphabeticCharactersOnly(b.pattern)
      );
      return descending ? -alphabeticalDifference : alphabeticalDifference;
    });
  }

  deletePattern(type: 'prefix' | 'suffix' | 'lexeme', index: number): void {
    this.patternsService.deletePattern(this.patterns, type, index);
    this.sortPatterns();
  }

  onAddPatternSubmit(): void {
    if (this.form.valid) {
      const { type, word } = this.form.value;

      this.patternsService.addPattern(this.patterns, type, this.languageMetadataRecord[this.language], word);
      this.sortPatterns();
      this.form.reset({ word: '', type: 'prefix' });
    } else {
      this.form.markAllAsTouched();
    }
  }

  private alphabeticCharactersOnly(value: string): string {
    return value.normalize('NFC').replace(/[^\p{L}]/gu, '');
  }
}
