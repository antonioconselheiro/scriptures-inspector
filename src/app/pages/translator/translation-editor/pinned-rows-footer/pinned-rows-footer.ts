import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { PinnedRowsService } from '../pinned-rows-service';

@Component({
  selector: 'app-pinned-rows-footer',
  templateUrl: './pinned-rows-footer.html',
  styleUrl: './pinned-rows-footer.scss'
})
export class PinnedRowsFooter implements AfterViewInit, OnDestroy {

  @ViewChild('rows', { static: true })
  private rows!: ElementRef<HTMLTableSectionElement>;

  constructor(readonly pinnedRows: PinnedRowsService) { }

  ngAfterViewInit(): void {
    this.pinnedRows.registerFooter(this.rows.nativeElement);
  }

  ngOnDestroy(): void {
    this.pinnedRows.clear();
    this.pinnedRows.unregisterFooter();
  }
}
