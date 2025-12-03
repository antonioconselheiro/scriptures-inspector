import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { Subject } from 'rxjs';
import { DocumentStorage } from '../document-storage';
import { ParsedPatterns } from '../parsed-patterns';

@Component({
  selector: 'app-dialog-patterns',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './dialog-patterns.html',
  styleUrl: './dialog-patterns.scss'
})
export class DialogPatterns extends ModalableDirective<{ lang: 'hebraic' | 'geez' | 'greek', patterns: ParsedPatterns }, ParsedPatterns> {

  patterns!: ParsedPatterns;
  lang = 'hebraic';
  form: any;
  title: {
    [lang: string]: string
  } = {
    ['hebraic']: 'Hebraic',
    ['geez']: 'Ge\'əz',
    ['greek']: 'Greek'
  }
  override response = new Subject<ParsedPatterns | void>();

  constructor(
    fb: FormBuilder,
    private literalsStorage: DocumentStorage
  ) {
    super();
    this.form = fb.group({
      word: ['', [Validators.required]],
      type: ['prefix', [Validators.required]]
    });
  }

  override onInjectData(data: { lang: 'hebraic' | 'geez' | 'greek', patterns: ParsedPatterns }): void {
    this.patterns = data.patterns;
    this.lang = data.lang;
  }

  deletePattern(lang: 'hebraic' | 'geez' | 'greek', type: 'prefix' | 'suffix', index: number, key: string): void {
    if (lang === 'hebraic') {
      this.literalsStorage.deleteHebraicPattern(type, index);
      this.patterns[type].delete(key);
    } else if (lang === 'geez') {
      this.literalsStorage.deleteGeezPattern(type, index);
      this.patterns[type].delete(key);
    } else if (lang === 'greek') {
      this.literalsStorage.deleteGreekPattern(type, index);
      this.patterns[type].delete(key);
    }
  }

  onAddPatternSubmit(): void {
    if (this.form.valid) {
      const { type, word } = this.form.value;
      let patterns: ParsedPatterns;
      if (this.lang === 'hebraic') {
        patterns = this.literalsStorage.addHebraicPattern(word, type);
        this.response.next(patterns);
      } else if (this.lang === 'greek') {
        patterns = this.literalsStorage.addGreekPattern(word, type);
        this.response.next(patterns);
      } else if (this.lang === 'geez') {
        patterns = this.literalsStorage.addGeezPattern(word, type);
        this.response.next(patterns);
      }

      this.form.reset();
    } else {
      this.form.markAllAsTouched();
    }
  }
}
