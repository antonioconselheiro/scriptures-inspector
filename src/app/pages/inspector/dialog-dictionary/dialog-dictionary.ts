import { Component } from '@angular/core';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-dialog-dictionary',
  imports: [],
  templateUrl: './dialog-dictionary.html',
  styleUrl: './dialog-dictionary.scss'
})
export class DialogDictionary extends ModalableDirective<object, boolean> {
  override response = new Subject<boolean | void>();
}
