import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { readImageBase64 } from '@shared/project/read-image-base64-fn';
import { Subject } from 'rxjs';
import { ArtifactTextEditorComponent } from '../artifact-text-editor';

@Component({
  selector: 'app-define-vector-dialog',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ArtifactTextEditorComponent
  ],
  templateUrl: './define-vector-dialog.html',
  styleUrl: './define-vector-dialog.scss',
})
export class DefineVectorDialog extends ModalableDirective<{
  fragmentImage: string
}, {
  vector: string
}> {

  override response = new Subject<{ vector: string } | void>();
  settingsForm: FormGroup;

  @ViewChild('imgPreview', { static: true })
  imgPreview!: ElementRef<HTMLImageElement>;

  processingSVG = false;
  fragmentBase64 = '';
  tracedSvg = '';

  imageFilter: {
    invert: number;
    blur?: number;
    brightness?: number;
    contrast?: number;
  } = {
      invert: 0,
      blur: undefined,
      brightness: undefined,
      contrast: undefined
    };

  readonly defaultOptions: Partial<PotracePlusOptions> = {
    crop: true,
    toRelative: true,
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
    maxSize: 2500,
    recode: false
  };

  constructor(
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder
  ) {
    super();
    this.settingsForm = this.fb.group({
      brightness: [1],
      contrast: [1],
      blur: [0],
      invert: [false],
      showImage: [true],
      showVector: [true]
    });
  }

  override onInjectData(data: { fragmentImage: string }): void {
    readImageBase64(data.fragmentImage)
      .then(base64 => {
        this.fragmentBase64 = base64 || '';
        this.cdr.detectChanges();
      })
      .catch(e => console.error(e));
  }

  get tracedSvgSafe() {
    return this.sanitizer.bypassSecurityTrustHtml(this.tracedSvg);
  }

  get showImage(): boolean {
    return this.settingsForm.get('showImage')?.value ?? false;
  }

  get showVector(): boolean {
    return this.settingsForm.get('showVector')?.value ?? false;
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
    const style = [`invert(${invert})`];
    if (blur !== undefined) style.push(`blur(${blur}px)`);
    if (brightness !== undefined) style.push(`brightness(${brightness})`);
    if (contrast !== undefined) style.push(`contrast(${contrast})`);

    return style.join(' ');
  }

  async updateSVG(): Promise<void> {
    this.processingSVG = true;
    const settings = this.getSettings();
    let { brightness, contrast, invert, blur } = settings;

    this.imageFilter.invert = !invert ? 0 : 1;
    this.imageFilter.blur = blur || 0;
    this.imageFilter.brightness = brightness || 0;
    this.imageFilter.contrast = contrast || 0;

    let traced: PotracePlusResult;

    try {
      traced = await PotracePlus(this.fragmentBase64, settings);
    } catch (e) {
      console.error("Could't trace image, error", e);
      this.processingSVG = false;
      return;
    }

    const { svg, bb, w, h, scaleAdjust } = traced;

    //  Set SVG attributes
    const parser = new DOMParser();
    const doc = parser.parseFromString(svg, 'image/svg+xml');

    const previewSVG = doc.documentElement;

    previewSVG.setAttribute(
      'viewBox',
      [-bb.x / scaleAdjust, -bb.y / scaleAdjust, w, h].join(' ')
    );

    previewSVG.setAttribute('width', String(w));
    previewSVG.setAttribute('height', String(h));
    previewSVG.setAttribute('fill', 'currentColor');

    this.tracedSvg = new XMLSerializer().serializeToString(previewSVG);
    this.processingSVG = false;
    this.cdr.detectChanges();
  }

  cancel(): void {
    this.close();
  }

  save(): void {
    this.response.next({ vector: this.tracedSvg });
    this.close();
  }
}
