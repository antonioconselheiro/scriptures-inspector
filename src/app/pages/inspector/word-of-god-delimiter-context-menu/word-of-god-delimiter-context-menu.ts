import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-word-of-god-delimiter-context-menu',
  imports: [
    CommonModule
  ],
  templateUrl: './word-of-god-delimiter-context-menu.html',
  styleUrl: './word-of-god-delimiter-context-menu.scss'
})
export class WordOfGodDelimiterContextMenu {
  @Input() visible = false;
  @Input() x = 0;
  @Input() y = 0;
  @Input() selectionStart = 0;
  @Input() selectionEnd = 0;
  @Input() lang: 'hebraic' | 'geez' | 'greek' = 'hebraic';

  @Output() optionSelected = new EventEmitter<{
    start: number,
    end: number,
    lang: 'hebraic' | 'geez' | 'greek'
  }>();

  godSaidSo(start: number, end: number): void {
    this.optionSelected.emit({
      start,
      end,
      lang: this.lang
    });
    this.visible = false;
  }
}
