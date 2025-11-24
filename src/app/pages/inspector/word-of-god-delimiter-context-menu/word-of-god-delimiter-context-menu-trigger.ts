import { Directive, HostListener, Input } from '@angular/core';
import { NewBook } from '../domain/new-book-enum';
import { OldBook } from '../domain/old-book-enum';
import { ScriptureVerse } from '../domain/scripture-verse-model';
import { WordOfGodDelimiterContextMenu } from './word-of-god-delimiter-context-menu';

@Directive({
  selector: '[appWordOfGodDelimiterContextMenuTrigger]'
})
export class WordOfGodDelimiterContextMenuTrigger {

  @Input('appWordOfGodDelimiterContextMenuTrigger')
  contextMenu!: WordOfGodDelimiterContextMenu;

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
      const startNode = range.startContainer;
      const startOffset = range.startOffset;
  
      const endNode = range.endContainer;
      const endOffset = range.endOffset;
  
      console.log("startNode:", startNode);
      console.log("startOffset:", startOffset);
      console.log("endNode:", endNode);
      console.log("endOffset:", endOffset);

      this.contextMenu.selectionStart = startOffset;
      this.contextMenu.selectionEnd = endOffset;
      this.contextMenu.x = event.clientX;
      this.contextMenu.y = event.clientY;
      this.contextMenu.visible = true;
      this.contextMenu.lang = this.lang;
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
