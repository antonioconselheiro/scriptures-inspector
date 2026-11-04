import { Component } from '@angular/core';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { BookTranslationTarget } from '@domain/book-translation-target-model';
import { BookMetadataTarget } from '@domain/book-metadata-target-model';
import { CurrentBook } from '@domain/current-book-model';
import { Language } from '@domain/language-model';
import { SourceBook } from '@domain/source-book-model';
import { Subject } from 'rxjs';
import { LexicalDictionaryDialog } from '../lexical-dictionary-dialog/lexical-dictionary-dialog';
import { PatternsDialog } from '../patterns-dialog/patterns-dialog';
import { TranslationVariationConfigDialog } from '../translation-variation-config-dialog/translation-variation-config-dialog';

export interface CodexConfigDialogData {
  bookMetadata: BookMetadataTarget;
  bookSource: SourceBook | null;
  language: Language | null;
  languageSource: string;
  currentBook: CurrentBook;
  translationBook: BookTranslationTarget | null;
}

type ConfigTab = 'patterns' | 'lexical' | 'translationVariations';

@Component({
  selector: 'app-codex-config-dialog',
  imports: [
    PatternsDialog,
    LexicalDictionaryDialog,
    TranslationVariationConfigDialog
  ],
  templateUrl: './codex-config-dialog.html',
  styleUrl: './codex-config-dialog.scss'
})
export class CodexConfigDialog extends ModalableDirective<CodexConfigDialogData, void> {

  bookMetadata!: BookMetadataTarget;
  bookSource!: SourceBook | null;
  language!: Language | null;
  languageSource!: string;
  currentBook!: CurrentBook;
  translationBook!: BookTranslationTarget | null;
  activeTab: ConfigTab = 'patterns';

  override response = new Subject<void>();

  override onInjectData(data: CodexConfigDialogData): void {
    this.bookMetadata = data.bookMetadata;
    this.bookSource = data.bookSource;
    this.language = data.language;
    this.languageSource = data.languageSource;
    this.currentBook = data.currentBook;
    this.translationBook = data.translationBook;
  }
}
