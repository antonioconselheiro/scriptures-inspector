import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-define-transcription-dialog',
  imports: [
    FormsModule
  ],
  templateUrl: './define-transcription-dialog.html',
  styleUrl: './define-transcription-dialog.scss',
})
export class DefineTranscriptionDialog extends ModalableDirective<string, string> {

  transcription = '';
  override response = new Subject<string | void>();

  override onInjectData(data: string): void {
    this.transcription = data;
  }

  save(): void {
    this.response.next(this.transcription);
    this.close();
  }
}
