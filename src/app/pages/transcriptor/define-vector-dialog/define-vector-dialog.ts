import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { LoadingObservable } from '@shared/loading/loading-observable';
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
    this.fragmentImage = data.fragmentImage;
  }

  getSettings(): PotracePlusOptions {
    const rawValue = this.settingsForm.getRawValue();
    rawValue.invert = rawValue.invert ? 1 : 0;
    return {
      ...this.defaultOptions,
      ...rawValue
    } as PotracePlusOptions;
  }

  async updateSVG(): Promise<void> {
    const settings = this.getSettings();
    let { brightness, contrast, invert, blur, split } = settings;
    let traced: PotracePlusResult;

    settings.recode = false;

    try {
      traced = await PotracePlus(this.imgPreview.nativeElement, settings as PotracePlusOptions);
    } catch {
      console.warn("Could't trace image – please try another filter setting or reset settings");
      return;
    }

    let { svg, svgSplit, d, bb, w, h, scaleAdjust } = traced
    let blobSvg = new Blob([svg]);

    // return splited or combined svg
    let traced_svg = !split ? svg : svgSplit;

    // downloadLink
    btnSvg.href = URL.createObjectURL(blobSvg);

    // filters
    invert = !invert ? '0' : '1';
    let filter = `filter:grayscale(1) invert(${invert}) blur(${blur}px) brightness(${brightness}) contrast(${contrast});`;

    imgPreview.style.cssText = filter;

    // show markup
    svgOut.value = traced_svg;
    svgOutPath.value = d;

    //render
    previewTraced.innerHTML = '';
    previewTraced.insertAdjacentHTML('beforeend', traced_svg)

    /**
     * adjust SVG preview viewBox for cropping
     */
    let previewSVG = previewTraced.querySelector('svg');
    previewSVG.setAttribute('viewBox', [-bb.x / scaleAdjust, -bb.y / scaleAdjust, w, h].join(' '))
    previewSVG.setAttribute('width', w)
    previewSVG.setAttribute('height', h)

  }

}
