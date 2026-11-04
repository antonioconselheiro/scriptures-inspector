import { Injectable } from '@angular/core';

interface PinnedRow {
  placeholder: Comment;
  rowSpans: Array<{ cell: HTMLTableCellElement; value: string | null }>;
  onStateChange: (pinned: boolean) => void;
}

@Injectable()
export class PinnedRowsService {

  private footerRows: HTMLTableSectionElement | null = null;
  private readonly rows = new Map<HTMLTableRowElement, PinnedRow>();

  get count(): number {
    return this.rows.size;
  }

  registerFooter(footerRows: HTMLTableSectionElement): void {
    this.footerRows = footerRows;
  }

  unregisterFooter(): void {
    this.footerRows = null;
  }

  pin(row: HTMLTableRowElement, onStateChange: (pinned: boolean) => void): void {
    if (!this.footerRows) {
      throw new Error('Pinned rows footer is not available.');
    }

    const parent = row.parentNode;
    if (!parent) {
      throw new Error('Cannot pin a table row that has no parent.');
    }

    const rowSpans = Array.from(row.cells, cell => ({
      cell,
      value: cell.getAttribute('rowspan')
    }));
    const placeholder = row.ownerDocument.createComment('pinned-row-placeholder');
    parent.insertBefore(placeholder, row);
    this.footerRows.appendChild(row);
    for (const { cell } of rowSpans) {
      cell.removeAttribute('rowspan');
    }
    this.rows.set(row, { placeholder, rowSpans, onStateChange });
    row.classList.add('pinnedMetadataRow');
    row.cells.item(0)?.classList.add('pinnedMetadataFirstCell');
    for (const button of Array.from(row.querySelectorAll('button'))) {
      if (button.textContent?.trim() === '×') {
        button.classList.add('pinnedRowRemoveButton');
      }
    }
    onStateChange(true);
  }

  unpin(row: HTMLTableRowElement): void {
    const pinnedRow = this.rows.get(row);
    if (!pinnedRow) {
      return;
    }

    const placeholderParent = pinnedRow.placeholder.parentNode;
    if (placeholderParent) {
      placeholderParent.insertBefore(row, pinnedRow.placeholder);
      pinnedRow.placeholder.remove();
    }

    for (const { cell, value } of pinnedRow.rowSpans) {
      if (value === null) {
        cell.removeAttribute('rowspan');
      } else {
        cell.setAttribute('rowspan', value);
      }
    }

    row.classList.remove('pinnedMetadataRow');
    row.cells.item(0)?.classList.remove('pinnedMetadataFirstCell');
    for (const button of Array.from(row.querySelectorAll('.pinnedRowRemoveButton'))) {
      button.classList.remove('pinnedRowRemoveButton');
    }
    this.rows.delete(row);
    pinnedRow.onStateChange(false);
  }

  clear(): void {
    for (const row of [...this.rows.keys()]) {
      this.unpin(row);
    }
  }
}
