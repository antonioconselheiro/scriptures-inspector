import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CurrentChapter } from '@domain/current-chapter-model';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { SystemService } from '@shared/system/system-service';

@Component({
  selector: 'app-define-field-morpheme-rule-context-menu',
  imports: [
    CommonModule
  ],
  templateUrl: './define-field-morpheme-rule-context-menu.html'
})
export class DefineFieldMorphemeRuleContextMenu {

  x = 0;
  y = 0;
  word = '';
  visible = false;
  morphemePosition: 'root' | 'prefix' | 'suffix' = 'prefix';
  morphemeConfigured: 'root' | 'prefix' | 'suffix' = 'root';
  parsedBook!: ParsedBookMetadata;

  @Input()
  current: CurrentChapter | null = null;

  constructor(
    private systemService: SystemService
  ) {}

  onDefineFieldRule(type: 'root' | 'prefix' | 'suffix'): void {
    if (!this.parsedBook.lexical[this.word]) {
      this.parsedBook.lexical[this.word] = {};
    }

    const lexicalConfig = this.parsedBook.lexical[this.word];
    if (type === 'root') {
      if (this.morphemeConfigured === 'prefix') {
        if (lexicalConfig.prefix) {
          const shouldContinue = confirm(`Definition of ${this.word} as prefix will be removed from lexical, continue?`);
          if (!shouldContinue) {
            return;
          }
        }

        delete lexicalConfig.prefix;
      } else if (this.morphemeConfigured === 'suffix') {
        if (lexicalConfig.suffix) {
          const shouldContinue = confirm(`Definition of ${this.word} as suffix will be removed from lexical, continue?`);
          if (!shouldContinue) {
            return;
          }
        }

        delete lexicalConfig.suffix;
      }
    } else if (this.morphemePosition === 'prefix' && type === 'prefix') {
      this.morphemeConfigured = type;
      lexicalConfig.prefix = '';
    } else if (this.morphemePosition === 'suffix' && type === 'suffix') {
      this.morphemeConfigured = type;
      lexicalConfig.suffix = '';
    }

    if (this.current) {
      this.systemService.triggerSaveCurrentBookMetadata(this.current);
      this.systemService.triggerSaveCurrentBookInterlinear(this.current);
    }

    setTimeout(() => this.visible = false);
  }
}
