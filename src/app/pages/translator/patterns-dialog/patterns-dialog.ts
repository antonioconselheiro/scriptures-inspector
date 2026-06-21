
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { Language } from '@domain/language-model';
import { PatternsSerialized } from '@domain/patterns-serialized';
import { languageMetadataRecord } from '@shared/language-metadata/language-metadata-record';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-patterns-dialog',
  imports: [
    ReactiveFormsModule
],
  templateUrl: './patterns-dialog.html',
  styleUrl: './patterns-dialog.scss'
})
export class PatternsDialog extends ModalableDirective<{ language: string, patterns: PatternsSerialized }, PatternsSerialized> {

  languageMetadataRecord: Record<string, Language> = languageMetadataRecord;
  patterns!: PatternsSerialized;
  language!: string;
  form: FormGroup<any>;

  override response = new Subject<PatternsSerialized | void>();

  constructor(
    fb: FormBuilder
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
  }

  deletePattern(type: 'prefix' | 'suffix' | 'lexeme', index: number): void {
    this.patterns[type].splice(index, 1);
  }

  onAddPatternSubmit(): void {
    if (this.form.valid) {
      const { type, word } = this.form.value;

      if (type === 'prefix') {
        this.patterns.prefix.push(word);
      } else if (type === 'sufix') {
        this.patterns.suffix.push(word);
      } else if (type === 'lexeme') {
        this.patterns.lexeme.push(word);
      }

      this.form.reset();
    } else {
      this.form.markAllAsTouched();
    }
  }
}
