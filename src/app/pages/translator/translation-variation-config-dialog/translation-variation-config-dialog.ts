import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { BookTranslationTarget } from '@domain/book-translation-target-model';
import { v4 as uuidv4 } from 'uuid';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-translation-variation-config-dialog',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './translation-variation-config-dialog.html',
  styleUrl: './translation-variation-config-dialog.scss',
})
export class TranslationVariationConfigDialog extends ModalableDirective<BookTranslationTarget, boolean> {

  book: BookTranslationTarget | null = null;
  form: FormGroup<any>;

  override response = new Subject<boolean | void>();

  constructor(
    fb: FormBuilder
  ) {
    super();
    this.form = fb.group({
      variant: ['', [Validators.required]]
    });
  }

  override onInjectData(book: BookTranslationTarget): void {
    this.book = book;
  }

  getVariations(): Array<{
    key: string,
    name: string
  }> {
    const book = this.book;
    if (!book) {
      return [];
    }

    return Object.keys(book.variations).map(key => {
      return {
        key,
        ...book.variations[key]
      }
    });
  }

  onChangeVariantName(id: string, value: string): void {
    if (this.book) {
      this.book.variations[id] = {
        name: value
      };
    }
  }

  onAddVariantSubmit(): void {
    if (this.form.valid && this.book) {
      const { variant } = this.form.value;
      const id = uuidv4();

      this.book.variations[id] = {
        name: variant
      };

      this.form.reset();
    } else {
      this.form.markAllAsTouched();
    }
  }

  deleteVariant(key: string): void {
    if (this.book) {
      if (confirm('Are you sure you want to remove this variation? This deletion is irreversible.')) {
        delete this.book.variations[key];
        this.book.chapters.forEach(chapter => {
          chapter.forEach(verse => {
            if (verse.variations) {
              delete verse.variations[key];
            }
          });
        }); 
      }
    }
  }
}
