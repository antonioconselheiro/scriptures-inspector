import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { BookTranslationTarget } from '@domain/book-translation-target-model';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-add-fragment-dialog',
  imports: [],
  templateUrl: './add-fragment-dialog.html',
  styleUrl: './add-fragment-dialog.scss',
})
export class AddFragmentDialog extends ModalableDirective<{
  fromFile: string
}, void> {

  override response = new Subject<void>();

  form: FormGroup<any>;
  fromFile = '';

  constructor(
    fb: FormBuilder
  ) {
    super();
    this.form = fb.group({
      variant: ['', [Validators.required]]
    });
  }

  override onInjectData(data: { fromFile: string }): void {
    this.fromFile = data.fromFile;
  }
}
