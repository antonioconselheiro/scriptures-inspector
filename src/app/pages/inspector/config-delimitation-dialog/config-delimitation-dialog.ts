import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { Subject } from 'rxjs';
import { ScriptureVerse } from '../domain/scripture-verse-model';
import { DelimitationSegment } from '../labelfy-metadata-delimitation/delimitation-segment-model';

@Component({
  selector: 'app-config-delimitation-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './config-delimitation-dialog.html',
  styleUrl: './config-delimitation-dialog.scss'
})
export class ConfigDelimitationDialog extends ModalableDirective<{ verse: ScriptureVerse, segment: DelimitationSegment }, boolean> {

  override response = new Subject<boolean | void>();

  verse: ScriptureVerse | null = null;
  segment: DelimitationSegment | null = null;
  configForm: FormGroup;

  constructor(
    private fb: FormBuilder
  ) {
    super();

    this.configForm = this.fb.group({
      type: ['godsaid', Validators.required],
      start: [0, [Validators.required, Validators.min(0)]],
      end: [0, [Validators.required, Validators.min(0)]],
    });
  }

  override onInjectData(data: { verse: ScriptureVerse, segment: DelimitationSegment }): void {
    this.verse = data.verse;
    this.configForm = this.fb.group({
      type: [data.segment.type, Validators.required],
      start: [data.segment.start, [Validators.required, Validators.min(0), Validators.max(data.verse.text.length)]],
      end: [data.segment.end, [Validators.required, Validators.min(0), Validators.max(data.verse.text.length)]]
    });
  }

  onSubmit(): void {
    if (this.configForm.invalid) {
      this.configForm.markAllAsTouched();
      return;
    }

    if (this.segment) {
      this.segment.type = this.configForm.value;
      this.segment.start = Number(this.configForm.value);
      this.segment.end = Number(this.configForm.value);
    }

    this.close();
  }
}
