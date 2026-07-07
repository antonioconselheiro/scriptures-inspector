import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-images-preview',
  imports: [],
  templateUrl: './images-preview.html',
  styleUrl: './images-preview.scss',
})
export class ImagesPreview {
  @Input()
  fromFiles: Array<string> = [];

  imageIndex = '0';

  getFileByIndex(index: string): string {
    if (!this.fromFiles || !this.fromFiles[+index]) {
      return '';
    }

    return 'local://'+encodeURIComponent(this.fromFiles[+index]);
  }
}
