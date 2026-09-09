import { Component } from '@angular/core';
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

  constructor(
    private fb: FormBuilder
  ) {
    super();
    this.settingsForm = this.fb.group({

      // Filter
      brightness: [1],
      contrast: [1],
      blur: [0],
      invert: [false],

      // Potrace
      turdsize: [1],
      opttolerance: [1],
      alphamax: [1],
      optcurve: [true],
      turnpolicy: ['majority'],
      maxSize: [2500],

      // SVG
      crop: [true],
      toRelative: [true],
      toShorthands: [true],
      split: [true],
      optimize: [true],

      // SVG string optimization
      minifyD: [0],
      decimals: [1],
      addDimensions: [true]
    });
  }

  override onInjectData(data: { fragmentImage: string }): void {
    this.fragmentImage = data.fragmentImage;
  }

  getSettings(): PotracePlusOptions {
    const rawValue = this.settingsForm.getRawValue();
    rawValue.invert = rawValue.invert ? 1 : 0;
    rawValue.minifyD = rawValue.minifyD ? 1 : 0;
    return rawValue as PotracePlusOptions;
  }

  async updateSVG(imgPreview, settings: PotracePlusOptions): Promise<void> {

    LoadingObservable.startLoading();

    let { minSize, maxSize, crop, scale, brightness, contrast, invert, blur, optimize, clip, minifyD, split } = settings
    let newSettings = JSON.stringify({ minSize, maxSize, crop, scale, brightness, contrast, optimize, split, invert, blur })
    let needsRetrace = lastSettings !== newSettings;


    let t0 = 0, t1 = 0;

    // retrace
    t0 = performance.now()

    if (needsRetrace) {

      settings.recode = false;

      try {
        traced = await PotracePlus(imgPreview, settings as PotracePlusOptions);
      }

      catch {
        console.warn("Could't trace image – please try another filter setting or reset settings")
      }
    } else {
      // just change SVG output e.g relative or shorthand optimization

      settings.recode = true

      let svgN = getSVG(traced.pathDataArr, traced.width, traced.height, settings)


      traced.d = svgN.d
      traced.dArr = svgN.dArr
      traced.pathData = svgN.pathData
      traced.svg = svgN.svg
      traced.svgSplit = svgN.svgSplit
    }

    t1 = performance.now() - t0;

    let { svg, svgSplit, d, width, height, commands, pathData, bb, w, h, scaleAdjust } = traced

    console.log(traced);

    let blobSvg = new Blob([svg]);
    let size = +(blobSvg.size / 1024).toFixed(3)
    let sizePath = +(new Blob([d]).size / 1024).toFixed(3)

    // return splited or combined svg
    let traced_svg = !split ? svg : svgSplit;

    // downloadLink
    btnSvg.href = URL.createObjectURL(blobSvg);

    // filters
    invert = !invert ? '0' : '1';
    let filter = `filter:grayscale(1) invert(${invert}) blur(${blur}px) brightness(${brightness}) contrast(${contrast});`;

    imgPreview.style.cssText = filter;

    // save last src
    lastSrc = imgPreview.src;
    lastSettings = newSettings;


    // summary
    info.textContent =
      `commands: ${commands} \nwidth: ${width}\nheight: ${height} \nsize (svg): ${size} KB \nsize (path): ${sizePath} KB \ntime: ${+t1.toFixed(3)} ms`

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


    // update PDF download 
    btnDownload.href = '';

    // create pdf on btn hover
    btnDownload.addEventListener('mouseover', (e) => {
      if (!btnDownload.getAttribute('href')) {
        let url = traced.getPdf();
        btnDownload.href = url;
      }
    })

    // hide loading indicators
    setTimeout(() => LoadingObservable.stopLoading());

  }

}
