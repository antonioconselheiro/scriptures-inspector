import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appCheckboxRangeSelection]',
  exportAs: 'checkboxRangeSelection'
})
export class CheckboxRangeSelectionDirective {
  private start: number | null = null;
  private end: number | null = null;
  private selecting = false;

  constructor(private readonly row: ElementRef<HTMLElement>) {}

  @HostListener('pointerdown', ['$event'])
  startSelection(event: PointerEvent): void {
    if (event.button !== 0) {
      return;
    }

    const cell = this.getCell(event.target);
    if (!cell) {
      return;
    }

    const index = Number(cell.dataset['checkboxRangeCell']);
    const startsOnCheckbox = event.target instanceof Element
      && event.target.closest('input[type="checkbox"]') !== null;

    if (startsOnCheckbox && this.isSelected(index)) {
      this.selecting = false;
      return;
    }

    this.start = index;
    this.end = index;
    this.selecting = true;
    if (!startsOnCheckbox) {
      event.preventDefault();
    }
  }

  @HostListener('pointerover', ['$event'])
  extendSelection(event: PointerEvent): void {
    const cell = this.getCell(event.target);
    if (this.selecting && cell) {
      this.end = Number(cell.dataset['checkboxRangeCell']);
    }
  }

  @HostListener('document:pointerup')
  @HostListener('document:pointercancel')
  stopSelection(): void {
    this.selecting = false;
  }

  @HostListener('document:pointerdown', ['$event'])
  clearSelectionOutsideRow(event: PointerEvent): void {
    if (!this.getCell(event.target)) {
      this.start = null;
      this.end = null;
      this.selecting = false;
    }
  }

  isSelected(index: number): boolean {
    return this.start !== null && this.end !== null
      && index >= Math.min(this.start, this.end)
      && index <= Math.max(this.start, this.end);
  }

  selectedIndexes(index: number, count: number): number[] {
    if (!this.isSelected(index) || this.start === null || this.end === null) {
      return [index];
    }

    const first = Math.min(this.start, this.end);
    const last = Math.min(Math.max(this.start, this.end), count - 1);
    return Array.from({ length: Math.max(0, last - first + 1) }, (_, offset) => first + offset);
  }

  private getCell(target: EventTarget | null): HTMLElement | null {
    if (!(target instanceof Element)) {
      return null;
    }
    const cell = target.closest<HTMLElement>('[data-checkbox-range-cell]');
    return cell?.closest('tr') === this.row.nativeElement ? cell : null;
  }
}
