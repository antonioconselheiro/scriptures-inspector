import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { sanitizeSvgFn } from './sanitize-svg-fn';

@Pipe({ name: 'safeSvg' })
export class SafeSvgPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(sanitizeSvgFn(svg));
  }
}
