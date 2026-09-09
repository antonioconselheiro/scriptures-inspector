import { Component } from '@angular/core';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-define-vector-dialog',
  imports: [],
  templateUrl: './define-vector-dialog.html',
  styleUrl: './define-vector-dialog.scss',
})
export class DefineVectorDialog extends ModalableDirective<{}, void> {
  override response = new Subject<void>();

  override onInjectData(data: {}): void {
    new PotracePlus('teste');
  }
}
