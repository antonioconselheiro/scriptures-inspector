import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NewBook } from '../domain/new-book-enum';
import { OldBook } from '../domain/old-book-enum';
import { ScriptureVerse } from '../domain/scripture-verse-model';

@Component({
  selector: 'app-translation-metadata-context-menu',
  imports: [
    CommonModule
  ],
  templateUrl: './translation-metadata-context-menu.html',
  styleUrl: './translation-metadata-context-menu.scss'
})
export class TranslationMetadataContextMenu {
  @Input() visible = false;
  @Input() x = 0;
  @Input() y = 0;
  @Input() selectionStart = 0;
  @Input() selectionEnd = 0;
  @Input() lang!: 'hebraic' | 'geez' | 'greek';
  @Input() book!: OldBook | NewBook;
  @Input() chapter!: number;
  @Input() verse!: ScriptureVerse;

  @Output() optionSelected = new EventEmitter<{
    type: 'godsaid' | 'keyword' | 'quantitative',
    lang: 'hebraic' | 'geez' | 'greek',
    start: number,
    end: number,
    book: OldBook | NewBook,
    chapter: number,
    verse: ScriptureVerse
  }>();

  defineAs(delimitationType: 'godsaid' | 'keyword' | 'quantitative', start: number, end: number): void {
    this.optionSelected.emit({
      type: delimitationType,
      start,
      end,
      lang: this.lang,
      book: this.book,
      chapter: this.chapter,
      verse: this.verse
    });
    this.visible = false;
  }
}
