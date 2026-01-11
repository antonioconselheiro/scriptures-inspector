import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-add-pattern-context-menu',
  imports: [
    CommonModule
  ],
  templateUrl: './add-pattern-context-menu.html',
  styleUrl: './add-pattern-context-menu.scss'
})
export class AddPatternContextMenu {
  @Input() visible = false;
  @Input() x = 0;
  @Input() y = 0;
  @Input() selectedWord = '';
  @Input() source = '';

  @Output() optionSelected = new EventEmitter<{
    word: string,
    type: 'prefix' | 'suffix',
    source: string
  }>();

  onSelect(type: 'prefix' | 'suffix', word: string) {
    this.optionSelected.emit({
      type,
      word,
      source: this.source
    });
    this.visible = false;
  }
}
