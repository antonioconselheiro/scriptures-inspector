import { Directive, HostListener, Input } from '@angular/core';
import { AddPatternContextMenu } from './add-pattern-context-menu';

@Directive({
  selector: '[appAddPatternContextMenuTrigger]'
})
export class AddPatternContextMenuTrigger {

  @Input('appAddPatternContextMenuTrigger')
  contextMenu!: AddPatternContextMenu;

  @Input()
  target!: `${string}-metadata` | `${string}-interlinear`;

  @HostListener('contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    event.preventDefault();
    const selectedText = window.getSelection()?.toString().trim();

    if (selectedText) {
      this.contextMenu.selectedWord = selectedText;
      this.contextMenu.x = event.clientX;
      this.contextMenu.y = event.clientY;
      this.contextMenu.visible = true;
      this.contextMenu.target = this.target;
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
