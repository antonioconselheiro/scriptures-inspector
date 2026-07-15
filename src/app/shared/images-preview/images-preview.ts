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
  files: Array<string> = [];

  imageIndex = '0';

  constructor(
    private cdr: ChangeDetectorRef
  ) {}

  getFileByIndex(index: string): string {
    if (!this.files || !this.files[+index]) {
      return '';
    }

    return 'local://'+encodeURIComponent(this.files[+index]);
  }

  previous(): void {
    let imageIndex = parseFloat(this.imageIndex);
    imageIndex = imageIndex - 1;
    if (imageIndex < 0) {
      imageIndex = this.files.length - 1;
    }
    this.imageIndex = imageIndex.toString();
    this.cdr.detectChanges();
  }

  next(): void {
    let imageIndex = parseFloat(this.imageIndex);
    imageIndex = imageIndex + 1;
    if (imageIndex >= this.files.length) {
      imageIndex = 0;
    }
    this.imageIndex = imageIndex.toString();
    this.cdr.detectChanges();
  }
}
