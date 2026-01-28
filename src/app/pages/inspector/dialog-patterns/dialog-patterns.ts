
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { Language } from '@domain/language-model';
import { PatternsSerialized } from '@domain/patterns-serialized';
import { languageMetadataRecord } from '@shared/language-metadata/language-metadata-record';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-dialog-patterns',
  imports: [
    ReactiveFormsModule
],
  templateUrl: './dialog-patterns.html',
  styleUrl: './dialog-patterns.scss'
})
export class DialogPatterns extends ModalableDirective<{ language: string, patterns: PatternsSerialized }, PatternsSerialized> {

  languageMetadataRecord: Record<string, Language> = languageMetadataRecord;
  patterns!: PatternsSerialized;
  language!: string;
  form: any;

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

  deletePattern(type: 'prefix' | 'suffix', index: number): void {
    delete this.patterns[type][index];
  }

  onAddPatternSubmit(): void {
    if (this.form.valid) {
      const { type, word } = this.form.value;

      if (type === 'prefix') {
        this.patterns.prefix.push(word);
      } else if (type === 'sufix') {
        this.patterns.suffix.push(word);
      }

      this.form.reset();
    } else {
      this.form.markAllAsTouched();
    }
  }
}
