import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BookInterlinearTarget } from '@domain/book-interlinear-target-model';
import { BookMetadataTarget } from '@domain/book-metadata-target-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { languageMetadataRecord } from '@shared/language-metadata/language-metadata-record';

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

  selectedWord = '';
  visible = false;
  x = 0;
  y = 0;

  readonly languageMetadataRecord = languageMetadataRecord;

  onAddPattern(type: 'prefix' | 'suffix', word: string): void {
    const langMetadata = this.languageMetadataRecord[this.sourceLanguage];
    const normalized = langMetadata.prefetchNormalizedToMatcher ? langMetadata.prefetchNormalizedToMatcher(word) : word;

    this.bookTarget.patterns[type].push(normalized);
    this.visible = false;
  }
}
