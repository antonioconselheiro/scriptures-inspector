import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BookMetadataTarget } from '@domain/book-metadata-target-model';
import { CurrentChapter } from '@domain/current-chapter-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { Project } from '@domain/project-model';
import { getProjectLanguageFn } from '@shared/language-metadata/get-project-language-fn';
import { languageMetadataRecord } from '@shared/language-metadata/language-metadata-record';
import { SystemService } from '@shared/system/system-service';
import { PatternsService } from '../patterns-service';

@Component({
  selector: 'app-add-pattern-context-menu',
  imports: [
    CommonModule
  ],
  templateUrl: './add-pattern-context-menu.html'
})
export class AddPatternContextMenu {

  sourceLanguage!: LanguageUnionType;
  bookTarget!: BookMetadataTarget;

  @Input({ required: true })
  current!: CurrentChapter;

  @Input({ required: true })
  project!: Project;

  selectedWord = '';
  selectedText = '';
  cellContent = '';
  visible = false;
  x = 0;
  y = 0;

  readonly languageMetadataRecord = languageMetadataRecord;

  constructor(
    private patternsService: PatternsService,
    private systemService: SystemService
  ) { }

  onAddPattern(type: 'prefix' | 'suffix' | 'lexeme', word: string): void {
    this.patternsService.addPattern(
      this.bookTarget.patterns,
      type,
      getProjectLanguageFn(this.project, this.sourceLanguage),
      word
    );

    if (this.current) {
      this.systemService.triggerSaveCurrentBookMetadata(this.current);
      this.systemService.triggerSaveCurrentBookInterlinear(this.current);
    }

    this.visible = false;
  }

  async onCopySelection(): Promise<void> {
    await navigator.clipboard.writeText(this.selectedText);
    this.visible = false;
  }

  async onCopyCell(): Promise<void> {
    await navigator.clipboard.writeText(this.cellContent);
    this.visible = false;
  }
}
