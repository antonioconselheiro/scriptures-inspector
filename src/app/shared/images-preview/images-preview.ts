import { ChangeDetectorRef, Component, Input } from '@angular/core';
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

  constructor(
    private cdr: ChangeDetectorRef
  ) {}

  getFileByIndex(index: string): string {
    if (!this.fromFiles || !this.fromFiles[+index]) {
      return '';
    }

    return 'local://'+encodeURIComponent(this.fromFiles[+index]);
  }

  previous(): void {
    let imageIndex = parseFloat(this.imageIndex);
    imageIndex = imageIndex - 1;
    if (imageIndex < 0) {
      imageIndex = this.fromFiles.length - 1;
    }
    this.imageIndex = imageIndex.toString();
    this.cdr.detectChanges();
  }

  next(): void {
    let imageIndex = parseFloat(this.imageIndex);
    imageIndex = imageIndex + 1;
    if (imageIndex >= this.fromFiles.length) {
      imageIndex = 0;
    }
    this.imageIndex = imageIndex.toString();
    this.cdr.detectChanges();
  }
}
