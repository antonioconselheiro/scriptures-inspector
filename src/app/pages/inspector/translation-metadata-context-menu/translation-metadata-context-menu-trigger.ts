import { Directive, HostListener, Input } from '@angular/core';
import { NewBook } from '../domain/new-book-enum';
import { OldBook } from '../domain/old-book-enum';
import { ScriptureVerse } from '../domain/scripture-verse-model';
import { TranslationMetadataContextMenu } from './translation-metadata-context-menu';

@Directive({
  selector: '[appTranslationMetadataContextMenu]'
})
export class TranslationMetadataContextMenuTrigger {

  @Input('appTranslationMetadataContextMenu')
  contextMenu!: TranslationMetadataContextMenu;

  @Input('lang')
  lang!: "hebraic" | "geez" | "greek";

  @Input()
  book!: OldBook | NewBook;

  @Input()
  chapter!: number;

  @Input()
  verse!: ScriptureVerse;

  @HostListener('contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    event.preventDefault();
    const selectedText = window.getSelection();
    const range = selectedText?.getRangeAt(0);

    if (range) {
      const startOffset = range.startOffset;
      const endOffset = range.endOffset;

      this.contextMenu.selectionStart = startOffset;
      this.contextMenu.selectionEnd = endOffset;
      this.contextMenu.x = event.clientX;
      this.contextMenu.y = event.clientY;
      this.contextMenu.visible = true;
      this.contextMenu.lang = this.lang;

      this.contextMenu.book = this.book;
      this.contextMenu.chapter = this.chapter;
      this.contextMenu.verse = this.verse;
    } else {
      this.contextMenu.visible = false;
    }
  }

  @HostListener('document:click')
  onDocumentClick() {
    if (this.contextMenu) {
      this.contextMenu.visible = false;
    }
  }
}
