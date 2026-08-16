import { Directive, HostListener, Input } from '@angular/core';
import { BookMetadataTarget } from '@domain/book-metadata-target-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { AddPatternContextMenu } from './add-pattern-context-menu';

@Directive({
  selector: '[appAddPatternContextMenuTrigger]'
})
export class AddPatternContextMenuTrigger {

  @Input('appAddPatternContextMenuTrigger')
  contextMenu!: AddPatternContextMenu;

  @Input()
  sourceLanguage!: LanguageUnionType;

  @Input()
  bookTarget!: BookMetadataTarget;

  @HostListener('contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    event.preventDefault();
    const selectedText = window.getSelection()?.toString().trim();

    if (selectedText) {
      this.contextMenu.selectedWord = selectedText;
      this.contextMenu.x = event.clientX;
      this.contextMenu.y = event.clientY;
      this.contextMenu.visible = true;
      this.contextMenu.sourceLanguage = this.sourceLanguage;
      this.contextMenu.bookTarget = this.bookTarget;
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
