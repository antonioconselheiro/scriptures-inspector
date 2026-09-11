import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { readImageBase64 } from '@shared/project/read-image-base64-fn';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-define-vector-dialog',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './define-vector-dialog.html',
  styleUrl: './define-vector-dialog.scss',
})
export class DefineVectorDialog extends ModalableDirective<{
  fragmentImage: string
}, void> {

  override response = new Subject<void>();
  fragmentImage = '';
  settingsForm: FormGroup;

  @ViewChild('imgPreview', { static: true })
  imgPreview!: ElementRef<HTMLImageElement>;

  tracedSvg = '';

  imageFilter = {
    invert: 0,
    blur: 0,
    brightness: 0,
    contrast: 0
  };

  defaultOptions: Partial<PotracePlusOptions> = {
    crop: true,
    toRelative: true,
    split: false,
    toShorthands: true,
    optimize: true,
    minifyD: true,
    decimals: 2,
    addDimensions: false,
    turdsize: 1,
    opttolerance: 1,
    alphamax: 1,
    optcurve: true,
    turnpolicy: 'majority',
    maxSize: 2500
  }

  constructor(
    private fb: FormBuilder
  ) {
    super();
    this.settingsForm = this.fb.group({
      brightness: [1],
      contrast: [1],
      blur: [0],
      invert: [false]
    });
  }

  override onInjectData(data: { fragmentImage: string }): void {
    readImageBase64(data.fragmentImage)
      .then(base64 => {
        console.info('[web] base64:', base64);
        this.fragmentImage = base64 || '';
      })
      .catch(e => console.error(e));
  }

  getSettings(): PotracePlusOptions {
    const rawValue = this.settingsForm.getRawValue();
    rawValue.invert = rawValue.invert ? 1 : 0;
    return {
      ...this.defaultOptions,
      ...rawValue
    } as PotracePlusOptions;
  }

  get imageFilterStyle(): string {
    const { invert, blur, brightness, contrast } = this.imageFilter;

    return `invert(${invert}) blur(${blur}px) brightness(${brightness}) contrast(${contrast})`;
  }

  async updateSVG(): Promise<void> {
    const settings = this.getSettings();
    let { brightness, contrast, invert, blur, split } = settings;

    this.imageFilter.invert = !invert ? 0 : 1;
    this.imageFilter.blur = blur || 0;
    this.imageFilter.brightness = brightness || 0;
    this.imageFilter.contrast = contrast || 0;

    let traced: PotracePlusResult;

    settings.recode = false;

    try {
      traced = await PotracePlus(this.imgPreview.nativeElement.src, settings as PotracePlusOptions);
    } catch (e) {
      console.warn("Could't trace image – please try another filter setting or reset settings", e);
      return;
    }

    const { svg, svgSplit, d, bb, w, h, scaleAdjust } = traced;

    // return splited or combined svg
    this.tracedSvg = !split ? svg : svgSplit;


    //const previewSVG = this.svgView.nativeElement.querySelector('svg');
//
    //if (previewSVG) {
    //  previewSVG.setAttribute('viewBox', [-bb.x / scaleAdjust, -bb.y / scaleAdjust, w, h].join(' '))
    //  previewSVG.setAttribute('width', String(w))
    //  previewSVG.setAttribute('height', String(h))
    //}
  }
}
