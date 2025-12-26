import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { languageList } from '../../../domain/language-list';
import { languageMetadataRecord } from '../../../shared/language-metadata/language-metadata-record';
import { languageUnion } from '../../../domain/language-union';
import { SystemService } from '../../../shared/system/system-service';
import { Language } from '../../inspector/domain/language-model';

@Component({
  selector: 'app-new-project-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './new-project-dialog.html',
  styleUrl: './new-project-dialog.scss'
})
export class NewProjectDialog {

  readonly languages = languageList;
  readonly languageMeta: { [lang: string]: Language } = languageMetadataRecord;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private system: SystemService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      destination: ['', Validators.required],

      purposes: this.fb.array([]),
      codices: this.fb.array([])
    });
  }

  /* ---------------- getters ---------------- */

  get purposes(): FormArray {
    return this.form.get('purposes') as FormArray;
  }

  get codex(): FormArray {
    return this.form.get('codices') as FormArray;
  }

  books(codexIndex: number): FormArray {
    return this.codex.at(codexIndex).get('books') as FormArray;
  }

  addPurpose(): void {
    this.purposes.push(
      this.fb.group({
        name: ['', Validators.required],
        kind: ['', Validators.required],
        language: [null as languageUnion | null, Validators.required]
      })
    );
  }

  addCodex(): void {
    this.codex.push(
      this.fb.group({
        name: ['', Validators.required],
        purpose: ['', Validators.required],
        books: this.fb.array([])
      })
    );
  }

  async addBook(codexIndex: number): Promise<void> {
    const folder = await this.system.chooseFolder();

    this.books(codexIndex).push(
      this.fb.group({
        book: ['', Validators.required],
        folder: [folder, Validators.required]
      })
    );
  }

  async chooseDestination(): Promise<void> {
    const folder = await this.system.chooseFolder();
    this.form.patchValue({ destination: folder });
  }

  async submit(): Promise<void> {
    if (this.form.invalid) return;

    const projectConfiguration = this.form.value;

    console.log('PROJECT CONFIGURATION JSON:', projectConfiguration);

    // implementação futura
    await this.system.saveProject();
  }
}
