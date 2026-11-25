import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { CurrentChapter } from '@domain/current-chapter-model';
import { MorphemeType } from '@domain/morpheme-type';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { SystemService } from '@shared/system/system-service';
import { SegmentationChanges } from '../translation-editor/shared/segmentation-changes';

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
  morphemePosition: MorphemeType = 'prefix';
  morphemeConfigured: MorphemeType = 'root';
  parsedBook!: ParsedBookMetadata;

  @Input({ required: true })
  current!: CurrentChapter;

  constructor(
    private systemService: SystemService,
    private segmentationChanges: SegmentationChanges,
    private changeDetector: ChangeDetectorRef
  ) {}

  onDefineFieldRule(type: MorphemeType): void {
    setTimeout(() => this.defineFieldRule(type));
  }

  private defineFieldRule(type: MorphemeType): void {
    if (type === this.morphemeConfigured) {
      this.visible = false;
      this.changeDetector.markForCheck();
      return;
    }
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
      this.morphemeConfigured = 'root';
    } else if (this.morphemePosition === 'prefix' && type === 'prefix') {
      this.morphemeConfigured = type;
      lexicalConfig.prefix = '';
    } else if (this.morphemePosition === 'suffix' && type === 'suffix') {
      this.morphemeConfigured = type;
      lexicalConfig.suffix = '';
    }

    this.segmentationChanges.lexicalChanged(this.parsedBook.lexical);
    if (this.current) {
      this.systemService.triggerSaveCurrentBookMetadata(this.current);
      this.systemService.triggerSaveCurrentBookInterlinear(this.current);
    }

    this.visible = false;
    this.changeDetector.markForCheck();
  }
}
