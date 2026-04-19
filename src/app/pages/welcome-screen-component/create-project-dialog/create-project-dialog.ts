import { Component } from '@angular/core';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-create-project-dialog',
  imports: [],
  templateUrl: './create-project-dialog.html',
  styleUrl: './create-project-dialog.scss',
})
export class CreateProjectDialog extends ModalableDirective<object, void> {
  override response = new Subject<void>();

}
