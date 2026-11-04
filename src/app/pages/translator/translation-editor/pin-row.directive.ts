import { AfterViewInit, Directive, ElementRef, OnDestroy, Renderer2 } from '@angular/core';
import { PinnedRowsService } from './pinned-rows-service';

@Directive({
  selector: 'tr[appPinRow]',
  standalone: true
})
export class PinRowDirective implements AfterViewInit, OnDestroy {

  private readonly row: HTMLTableRowElement;
  private cell!: HTMLTableCellElement;
  private button!: HTMLButtonElement;
  private originalCellPosition = '';
  private originalCellPaddingRight = '';
  private pinned = false;
  private unlisten: (() => void) | null = null;

  constructor(
    elementRef: ElementRef<HTMLTableRowElement>,
    private renderer: Renderer2,
    private pinnedRows: PinnedRowsService
  ) {
    this.row = elementRef.nativeElement;
  }

  ngAfterViewInit(): void {
    const cells = Array.from(this.row.cells);
    const cell = cells.reverse().find(candidate =>
      !Array.from(candidate.querySelectorAll('button'))
        .some(button => button.textContent?.trim() === '×')
    );
    if (!cell) {
      throw new Error('Cannot add a pin to a table row without a cell.');
    }

    this.cell = cell;
    this.originalCellPosition = this.cell.style.position;
    this.originalCellPaddingRight = this.cell.style.paddingRight;
    this.renderer.setStyle(this.cell, 'position', 'relative');
    this.renderer.setStyle(this.cell, 'padding-right', '2rem');

    this.button = this.renderer.createElement('button');
    this.renderer.setAttribute(this.button, 'type', 'button');
    this.renderer.addClass(this.button, 'pin-row-button');
    this.createPinIcon();
    this.updateButton(false);
    this.renderer.appendChild(this.cell, this.button);
    this.unlisten = this.renderer.listen(this.button, 'click', (event: Event) => {
      event.stopPropagation();
      this.togglePin();
    });
  }

  ngOnDestroy(): void {
    if (this.pinned && this.cell) {
      this.pinnedRows.unpin(this.row);
    }

    this.unlisten?.();
    if (this.cell && this.button) {
      this.renderer.removeChild(this.cell, this.button);
      this.renderer.setStyle(this.cell, 'position', this.originalCellPosition || null);
      this.renderer.setStyle(this.cell, 'padding-right', this.originalCellPaddingRight || null);
    }
  }

  private togglePin(): void {
    if (this.pinned) {
      this.pinnedRows.unpin(this.row);
    } else {
      this.pinnedRows.pin(this.row, pinned => {
        this.pinned = pinned;
        this.updateButton(pinned);
      });
    }
  }

  private updateButton(pinned: boolean): void {
    const label = pinned ? 'Unpin row' : 'Pin row';
    this.renderer.setProperty(this.button, 'title', label);
    this.renderer.setAttribute(this.button, 'aria-label', label);
    this.renderer.setAttribute(this.button, 'aria-pressed', String(pinned));
  }

  private createPinIcon(): void {
    const svg = this.renderer.createElement('svg', 'http://www.w3.org/2000/svg');
    this.renderer.setAttribute(svg, 'viewBox', '0 0 24 24');
    this.renderer.setAttribute(svg, 'width', '18');
    this.renderer.setAttribute(svg, 'height', '18');
    this.renderer.setAttribute(svg, 'aria-hidden', 'true');
    this.renderer.setAttribute(svg, 'focusable', 'false');

    const path = this.renderer.createElement('path', 'http://www.w3.org/2000/svg');
    this.renderer.setAttribute(path, 'd', 'M16 3H8v2l1 1v5l-3 3v2h5v6h2v-6h5v-2l-3-3V6l1-1V3z');
    this.renderer.setAttribute(path, 'fill', 'currentColor');
    this.renderer.appendChild(svg, path);
    this.renderer.appendChild(this.button, svg);
  }
}
