import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { Toolbox } from '@shared/toolbox/toolbox';
import { ToolboxVisibilityService } from '@shared/toolbox/toolbox-visibility-service';

@Component({
  selector: 'app-text-size-controller-toolbox',
  imports: [AsyncPipe, Toolbox],
  templateUrl: './text-size-controller-toolbox.html',
  styleUrl: './text-size-controller-toolbox.scss'
})
export class TextSizeControllerToolbox {

  constructor(readonly toolboxVisibility: ToolboxVisibilityService) { }

  zoomOut(): void {
    const fontScale = getComputedStyle(document.body).getPropertyValue('--font-scale').trim();
    document.body.style.setProperty('--font-scale', String(Number(fontScale) - 0.1));
  }

  resetZoom(): void {
    document.body.style.setProperty('--font-scale', '1');
  }

  zoomIn(): void {
    const fontScale = getComputedStyle(document.body).getPropertyValue('--font-scale').trim();
    document.body.style.setProperty('--font-scale', String(Number(fontScale) + 0.1));
  }
}
