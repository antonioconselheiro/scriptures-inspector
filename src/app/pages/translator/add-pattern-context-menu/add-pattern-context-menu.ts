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
  selectedSegment = '';
  selectedFullWord = '';
  selectionAtWordStart = false;
  selectionAtWordEnd = false;
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

  canDefineDistinct(type: 'prefix' | 'suffix', scope: 'segment' | 'word' = 'segment'): boolean {
    const normalize = getProjectLanguageFn(this.project, this.sourceLanguage).normalizeFn ?? ((value: string) => value);
    const segment = normalize(scope === 'word' ? this.selectedFullWord : this.selectedSegment);
    const word = normalize(this.selectedWord);
    const entries = scope === 'word' ? this.bookTarget.patterns.wordDistinct : this.bookTarget.patterns.distinct;
    const existing = Object.entries(entries ?? {}).find(([key]) => normalize(key) === segment)?.[1];
    const other = normalize(existing?.[type === 'prefix' ? 'suffix' : 'prefix'] ?? '');
    return !!word
      && word.length < segment.length
      && word.length + other.length <= segment.length
      && (scope === 'segment' || (type === 'prefix' ? this.selectionAtWordStart : this.selectionAtWordEnd))
      && (type === 'prefix' ? segment.startsWith(word) : segment.endsWith(word));
  }

  onAddDistinctPattern(type: 'prefix' | 'suffix', scope: 'segment' | 'word' = 'segment'): void {
    this.patternsService.addDistinctPattern(
      this.bookTarget.patterns,
      type,
      getProjectLanguageFn(this.project, this.sourceLanguage),
      scope === 'word' ? this.selectedFullWord : this.selectedSegment,
      this.selectedWord,
      scope
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
