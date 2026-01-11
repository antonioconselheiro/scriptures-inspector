import { Directive, HostListener, Input } from '@angular/core';
import { AddPatternContextMenu } from './add-pattern-context-menu';

@Directive({
  selector: '[appAddPatternContextMenuTrigger]'
})
export class AddPatternContextMenuTrigger {

  @Input('appAddPatternContextMenuTrigger')
  contextMenu!: AddPatternContextMenu;

  @Input()
  source!: string;

  @HostListener('contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    event.preventDefault();
    const selectedText = window.getSelection()?.toString().trim();

    if (selectedText) {
      this.contextMenu.selectedWord = selectedText;
      this.contextMenu.x = event.clientX;
      this.contextMenu.y = event.clientY;
      this.contextMenu.visible = true;
      this.contextMenu.source = this.source;
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
