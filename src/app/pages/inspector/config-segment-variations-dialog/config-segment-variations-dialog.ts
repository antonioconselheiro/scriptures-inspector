import { Component } from '@angular/core';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-config-segment-variations-dialog',
  imports: [],
  templateUrl: './config-segment-variations-dialog.html',
  styleUrl: './config-segment-variations-dialog.scss',
})
export class ConfigSegmentVariationsDialog extends ModalableDirective<object, object> {
  override response = new Subject<object | void>();

  override onInjectData(book: object): void {
  }
}
