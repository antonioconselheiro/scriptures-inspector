import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BookInterlinearTarget } from '@domain/book-interlinear-target-model';
import { BookMetadataTarget } from '@domain/book-metadata-target-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { languageMetadataRecord } from '@shared/language-metadata/language-metadata-record';
import { PatternsService } from '../patterns-service';
import { CurrentChapter } from '@domain/current-chapter-model';
import { SystemService } from '@shared/system/system-service';

@Component({
  selector: 'app-add-pattern-context-menu',
  imports: [
    CommonModule
  ],
  templateUrl: './add-pattern-context-menu.html',
  styleUrl: './add-pattern-context-menu.scss'
})
export class AddPatternContextMenu {

  @Input()
  sourceLanguage!: LanguageUnionType;

  @Input()
  bookTarget!: BookMetadataTarget | BookInterlinearTarget;

  @Input()
  current: CurrentChapter | null = null;

  selectedWord = '';
  visible = false;
  x = 0;
  y = 0;

  readonly languageMetadataRecord = languageMetadataRecord;

  constructor(
    private patternsService: PatternsService,
    private systemService: SystemService
  ) { }

  onAddPattern(type: 'prefix' | 'suffix' | 'lexeme', word: string): void {
    this.patternsService.addPattern(this.bookTarget.patterns, type, this.languageMetadataRecord[this.sourceLanguage], word);

    if (this.current) {
      this.systemService.triggerSaveCurrentBookMetadata(this.current);
      this.systemService.triggerSaveCurrentBookInterlinear(this.current);
    }

    this.visible = false;
  }
}
