import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BookMetadataTarget } from '@domain/book-metadata-target-model';
import { BookTranslationTarget } from '@domain/book-translation-target-model';
import { BookVerse } from '@domain/book-verse-model';
import { CurrentChapter } from '@domain/current-chapter-model';
import { CurrentVerseIndex } from '@domain/current-verse-index-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { SourceBook } from '@domain/source-book-model';
import { SourceVerse } from '@domain/source-verse-model';
import { WordSegment } from '@domain/word-segment-model';
import { AddPatternContextMenu } from '../../add-pattern-context-menu/add-pattern-context-menu';
import { AddPatternContextMenuTrigger } from '../../add-pattern-context-menu/add-pattern-context-menu-trigger';
import { CustomTranslationComponent } from '../custom-translation/custom-translation-component';
import { AbstractInspectorDiretive } from '../shared/abstract-inspector-directive';
import { FunctionProxyPipe } from '../shared/function-proxy-pipe';
import { LexicalPipe } from '../shared/lexical-pipe';
import { LiteralizatePipe } from '../shared/literalizate-pipe';
import { ProjectDataService } from '../shared/project/project-data-service';
import { ProjectMetadataService } from '../shared/project/project-metadata-service';
import { TranslationViewing } from '@domain/translation-viewing-model';

@Component({
  selector: 'app-scripture-metadata-component',
  imports: [
    LexicalPipe,
    LiteralizatePipe,
    FunctionProxyPipe,
    CustomTranslationComponent,
    AddPatternContextMenuTrigger
  ],
  templateUrl: './scripture-metadata-component.html',
  styleUrl: './scripture-metadata-component.scss'
})
export class ScriptureMetadataComponent extends AbstractInspectorDiretive {

  @Input()
  current!: CurrentChapter;

  @Input()
  pipeUpdaterController = 0;

  @Input()
  sourceBook!: SourceBook;

  @Input()
  parsedBook!: ParsedBookMetadata;

  @Input()
  sourceLanguage!: LanguageUnionType;

  @Input()
  sourceVerse!: BookVerse<{ text: string; }>;

  @Input()
  bookTarget!: BookMetadataTarget;

  @Input()
  customTranslation: BookTranslationTarget | undefined;

  @Input()
  viewingTranslationBookRecord: {
    readonly [source: string]: TranslationViewing;
  } = {};

  @Input()
  addPatternMenuRef!: AddPatternContextMenu;

  @Output()
  showLegend = new EventEmitter<boolean>();

  constructor(
    private projectService: ProjectDataService,
    protected projectMetadataService: ProjectMetadataService
  ) {
    super();
  }

  private getCurrent(currentIndex: number): CurrentVerseIndex {
    return { ...this.current, verseIndex: currentIndex };
  }

  getTranslations(): Array<{
    source: string;
    name: string;
    verses: any;
  }> {
    return Object.keys(this.viewingTranslationBookRecord).map(source => {
      const name = this.viewingTranslationBookRecord[source].name;
      const verses = this.viewingTranslationBookRecord[source].chapters[this.current.chapter];

      return {
        source,
        name,
        verses
      }
    });
  }

  removeTranslationViewing(source: string): void {

  }

  splitIntoMatrix(text: string): Array<Array<{
    index: number;
    word: string;
  }>> {
    return this.projectService.splitIntoMatrix(this.parsedBook, text);
  }

  //  word of God
  setAsWordOfGod(input: HTMLInputElement, segments: Array<WordSegment>): void {
    this.projectMetadataService.setAsWordOfGod(
      input.checked,
      this.bookTarget,
      this.sourceLanguage,
      this.getCurrent(this.sourceVerse.verse.index),
      this.sourceVerse,
      segments
    );
  }

  getScriptureMetadataWordOfGod(segments: Array<WordSegment>): boolean {
    return this.projectMetadataService.getScriptureMetadataWordOfGod(
      this.bookTarget,
      this.sourceLanguage,
      this.getCurrent(this.sourceVerse.verse.index),
      segments
    );
  }

  cleanWordOfGodFromVerse(): void {
    if (!confirm('Confirm clean words set as "word of God"?')) {
      return;
    }

    this.projectMetadataService.cleanWordOfGodFromVerse(this.bookTarget, this.getCurrent(this.sourceVerse.verse.index));
  }

  //  metadata
  getScriptureMetadataDefinedKind(segment: WordSegment): '' | 'godname' | 'keyword' | 'character' | 'amount' {
    return this.projectMetadataService.getScriptureMetadataDefinedKind(
      this.bookTarget,
      this.sourceLanguage,
      this.getCurrent(this.sourceVerse.verse.index),
      segment
    );
  }

  updateScripturesMetadata(select: HTMLSelectElement, source: SourceVerse, segment: WordSegment): void {
    this.projectMetadataService.updateScripturesMetadata(
      this.bookTarget,
      this.sourceLanguage,
      this.getCurrent(source.verse.index),
      select.value,
      source,
      segment
    );
  }

  cleanScriptureMetadata(sourceVerseIndex: number): void {
    if (!confirm('remove metadata?')) {
      return;
    }

    this.projectMetadataService.cleanScriptureMetadata(this.bookTarget, this.getCurrent(sourceVerseIndex));
  }
}
