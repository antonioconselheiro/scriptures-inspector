import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckboxRangeSelectionDirective } from './checkbox-range-selection.directive';

@Component({
  imports: [CheckboxRangeSelectionDirective],
  template: `
    <table>
      @for (row of rows; track $index; let rowIndex = $index) {
        <tr appCheckboxRangeSelection #selection="checkboxRangeSelection">
          @for (value of row; track $index; let index = $index) {
            <td [attr.data-checkbox-range-cell]="index"
                [class.wordOfGodSelected]="selection.isSelected(index)">
              <input type="checkbox" [checked]="value" [disabled]="rowIndex === 1 && index === 1"
                (change)="apply(rowIndex, selection.selectedIndexes(index, row.length), $any($event.target).checked)">
            </td>
          }
        </tr>
      }
    </table>
    <button>Outside</button>
  `
})
class TestHostComponent {
  rows = [[false, true, false, false], [false, true, false, false]];

  apply(rowIndex: number, indexes: number[], value: boolean): void {
    for (const index of indexes) {
      if (rowIndex !== 1 || index !== 1) {
        this.rows[rowIndex][index] = value;
      }
    }
  }
}

describe('CheckboxRangeSelectionDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let rows: HTMLTableRowElement[];

  function pointer(target: Element, type: string, button = 0): void {
    target.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, button }));
    fixture.detectChanges();
  }

  function selected(row: HTMLTableRowElement): boolean[] {
    return Array.from(row.cells, cell => cell.classList.contains('wordOfGodSelected'));
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    rows = Array.from(fixture.nativeElement.querySelectorAll('tr'));
  });

  it('selects a reverse range, toggles it together, and preserves selection for the next click', () => {
    pointer(rows[0].cells[3], 'pointerdown');
    pointer(rows[0].cells[1], 'pointerover');
    pointer(document.body, 'pointerup');
    expect(selected(rows[0])).toEqual([false, true, true, true]);

    const checkbox = rows[0].cells[2].querySelector('input')!;
    pointer(checkbox, 'pointerdown');
    pointer(checkbox, 'pointerup');
    checkbox.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.rows[0]).toEqual([false, true, true, true]);
    expect(selected(rows[0])).toEqual([false, true, true, true]);

    checkbox.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.rows[0]).toEqual([false, false, false, false]);
  });

  it('keeps rows independent and clears the previous range when another row is selected', () => {
    pointer(rows[0].cells[0], 'pointerdown');
    pointer(rows[0].cells[2], 'pointerover');
    pointer(document.body, 'pointerup');
    pointer(rows[1].cells[0], 'pointerdown');
    pointer(rows[1].cells[2], 'pointerover');
    pointer(document.body, 'pointerup');
    expect(selected(rows[0])).toEqual([false, false, false, false]);
    expect(selected(rows[1])).toEqual([true, true, true, false]);

    rows[1].cells[2].querySelector('input')!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.rows[1]).toEqual([true, true, true, false]);
    rows[1].cells[2].querySelector('input')!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.rows[1]).toEqual([false, true, false, false]);

    pointer(fixture.nativeElement.querySelector('button'), 'pointerdown');
    expect(selected(rows[1])).toEqual([false, false, false, false]);
  });

  it('starts a new selection when clicking a checkbox outside the existing range', () => {
    pointer(rows[0].cells[0], 'pointerdown');
    pointer(rows[0].cells[1], 'pointerover');
    pointer(document.body, 'pointerup');

    const checkbox = rows[0].cells[3].querySelector('input')!;
    pointer(checkbox, 'pointerdown');
    pointer(checkbox, 'pointerup');
    checkbox.click();
    fixture.detectChanges();

    expect(selected(rows[0])).toEqual([false, false, false, true]);
    expect(fixture.componentInstance.rows[0]).toEqual([false, true, false, true]);
  });

  it('stops selection on pointer cancellation and ignores secondary clicks', () => {
    pointer(rows[0].cells[0], 'pointerdown', 2);
    pointer(rows[0].cells[1], 'pointerover');
    expect(selected(rows[0])).toEqual([false, false, false, false]);
    pointer(rows[0].cells[0], 'pointerdown');
    pointer(document.body, 'pointercancel');
    pointer(rows[0].cells[2], 'pointerover');
    expect(selected(rows[0])).toEqual([true, false, false, false]);
  });
});
