import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { Subject } from 'rxjs';
import { DocumentStorage } from '../document-storage';
import { ParsedPatterns } from '../parsed-patterns';

@Component({
  selector: 'app-dialog-extrapolations',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './dialog-extrapolations.html',
  styleUrl: './dialog-extrapolations.scss'
})
export class DialogExtrapolations extends ModalableDirective<{ lang: 'hebraic' | 'geez' | 'greek' }, ParsedPatterns> {
  override response = new Subject<ParsedPatterns | void>();

  form: any;
  lang = 'hebraic';

  constructor(
    fb: FormBuilder,
    private literalsStorage: DocumentStorage
  ){
    super();
    this.form = fb.group({
      word: ['', [Validators.required]],
      type: ['prefix', [Validators.required]]
    });
  }

  override onInjectData(data: { lang: 'hebraic' | 'geez' | 'greek' }): void {
    this.lang = data.lang;
  }

  onPatternFormSubmit(): void {
    if (this.form.valid) {
      const { type, value } = this.form.value;
      let patterns: ParsedPatterns;
      if (this.lang === 'hebraic') {
        patterns = this.literalsStorage.addHebraicPattern(value, type);
        this.response.next(patterns);
      } else if (this.lang === 'greek') {
        patterns = this.literalsStorage.addGreekPattern(value, type);
        this.response.next(patterns);
      } else if (this.lang === 'geez') {
        patterns = this.literalsStorage.addGeezPattern(value, type);
        this.response.next(patterns);
      }

      this.form.reset();
      this.close();
    } else {
      this.form.markAllAsTouched();
    }
  }
}
