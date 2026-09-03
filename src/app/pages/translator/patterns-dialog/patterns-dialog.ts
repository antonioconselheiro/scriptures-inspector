
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { Language } from '@domain/language-model';
import { PatternsSerialized } from '@domain/patterns-serialized-model';
import { languageMetadataRecord } from '@shared/language-metadata/language-metadata-record';
import { Subject } from 'rxjs';
import { PatternsService } from '../patterns-service';

@Component({
  selector: 'app-patterns-dialog',
  imports: [
    ReactiveFormsModule
],
  templateUrl: './patterns-dialog.html',
  styleUrl: './patterns-dialog.scss'
})
export class PatternsDialog extends ModalableDirective<{ language: string, patterns: PatternsSerialized }, PatternsSerialized> {

  readonly indexNotFound = -1;
  languageMetadataRecord: Record<string, Language> = languageMetadataRecord;
  patterns!: PatternsSerialized;
  language!: string;
  form: FormGroup<any>;

  override response = new Subject<PatternsSerialized | void>();

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
  }

  deletePattern(type: 'prefix' | 'suffix' | 'lexeme', index: number): void {
    this.patternsService.deletePattern(this.patterns, type, index);
  }

  onAddPatternSubmit(): void {
    if (this.form.valid) {
      const { type, word } = this.form.value;

      this.patternsService.addPattern(this.patterns, type, this.languageMetadataRecord[this.language], word);
      this.form.reset();
    } else {
      this.form.markAllAsTouched();
    }
  }
}
