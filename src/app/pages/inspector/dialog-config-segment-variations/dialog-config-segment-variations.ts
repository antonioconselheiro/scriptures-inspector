import { Component } from '@angular/core';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-dialog-config-segment-variations',
  imports: [],
  templateUrl: './dialog-config-segment-variations.html',
  styleUrl: './dialog-config-segment-variations.scss',
})
export class DialogConfigSegmentVariations extends ModalableDirective<object, object> {
  override response = new Subject<object | void>();

  override onInjectData(book: object): void {
  }
}
