import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-images-preview',
  imports: [
    FormsModule
  ],
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

  previous(): void {
    this.imageIndex = (parseInt(this.imageIndex) - 1).toString();
    if (parseInt(this.imageIndex) < 0) {
      this.imageIndex = (this.fromFiles.length - 1).toString();
    }
  }

  next(): void {
    this.imageIndex = (parseInt(this.imageIndex) + 1).toString();
    if (parseInt(this.imageIndex) >= this.fromFiles.length) {
      this.imageIndex = '0';
    }
  }
}
