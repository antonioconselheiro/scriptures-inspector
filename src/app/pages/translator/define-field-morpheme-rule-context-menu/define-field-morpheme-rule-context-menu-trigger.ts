import { Directive, HostListener, Input } from '@angular/core';
import { DefineFieldMorphemeRuleContextMenu } from './define-field-morpheme-rule-context-menu';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';

@Directive({
  selector: '[appDefineFieldMorphemeRuleContextMenuTrigger]',
})
export class DefineFieldMorphemeRuleContextMenuTrigger {

  @Input('appDefineFieldMorphemeRuleContextMenuTrigger')
  contextMenu!: DefineFieldMorphemeRuleContextMenu;

  @Input()
  morphemePosition: 'common' | 'prefix' | 'suffix' = 'common';

  @Input()
  morphemeConfigured: 'common' | 'prefix' | 'suffix' = 'common';

  @Input()
  word!: string;

  @Input()
  parsedBook!: ParsedBookMetadata;

  @HostListener('contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    event.preventDefault();

    if (this.morphemePosition !== 'common') {
      this.contextMenu.x = event.clientX;
      this.contextMenu.y = event.clientY;
      this.contextMenu.visible = true;
      this.contextMenu.word = this.word;
      this.contextMenu.morphemePosition = this.morphemePosition;
      this.contextMenu.morphemeConfigured = this.morphemeConfigured;
      this.contextMenu.parsedBook = this.parsedBook;
    }
  }

  @HostListener('document:click')
  onDocumentClick() {
    if (this.contextMenu) {
      this.contextMenu.visible = false;
    }
  }
}
