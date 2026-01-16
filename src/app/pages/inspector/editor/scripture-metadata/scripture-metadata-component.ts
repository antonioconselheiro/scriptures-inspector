import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BookVerse } from '@domain/book-verse-model';
import { CurrentChapter } from '@domain/current-chapter-model';
import { CurrentVerseIndex } from '@domain/current-verse-index-model';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { ProjectData2 } from '@domain/project-data-2-model';
import { ProjectStructureMetadataEditor } from '@domain/project-structure-metadata-editor-model';
import { SourceBook } from '@domain/source-book-model';
import { SourceVerse } from '@domain/source-verse-model';
import { WordSegment } from '@domain/word-segment-model';
import { languageMetadataRecord } from '@shared/language-metadata/language-metadata-record';
import { AddPatternContextMenu } from '../../add-pattern-context-menu/add-pattern-context-menu';
import { AddPatternContextMenuTrigger } from '../../add-pattern-context-menu/add-pattern-context-menu-trigger';
import { CustomTranslationComponent } from '../custom-translation/custom-translation-component';
import { AbstractInspectorDiretive } from '../shared/abstract-inspector-directive';
import { FunctionProxyPipe } from '../shared/function-proxy-pipe';
import { LexicalPipe } from '../shared/lexical-pipe';
import { LiteralizatePipe } from '../shared/literalizate-pipe';
import { ProjectDataService } from '../shared/project/project-data-service';
import { ProjectMetadataService } from '../shared/project/project-metadata-service';
import { LanguageUnionType } from '@domain/language-union-type';

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
  sourceLanguage!: LanguageUnionType;

  @Input()
  parsedBook!: ParsedBookMetadata;

  @Input()
  sourceVerse!: BookVerse<{ text: string; }>

  @Input()
  projectData: ProjectData2 = {};

  @Input()
  metadataEditor!: ProjectStructureMetadataEditor;

  @Input()
  viewingTranslationBookRecord: {
    readonly [source: string]: {
      translation: string;
      verse: Readonly<BookVerse<{ text: string }>>
    }
  } = {};

  @Input()
  addPatternMenuRef!: AddPatternContextMenu;

  @Output()
  showLegend = new EventEmitter<boolean>();

  readonly languageMetadataRecord = languageMetadataRecord;

  constructor(
    private projectService: ProjectDataService,
    protected projectMetadataService: ProjectMetadataService
  ) {
    super();
  }

  private getCurrent(currentIndex: number): CurrentVerseIndex {
    return { ...this.current, verseIndex: currentIndex };
  }

  getTranslations(): Array<{ source: string, translation: string, verse: Readonly<BookVerse<{ text: string }>>}> {
    return Object.keys(this.viewingTranslationBookRecord).map(source => {
      return {
        source,
        ...this.viewingTranslationBookRecord[source]
      };
    });
  }

  removeTranslationViewing(source: string): void {

  }

  splitIntoMatrix(parsedBook: ParsedBookMetadata, text: string): Array<Array<{
    index: number;
    word: string;
  }>> {
    return this.projectService.splitIntoMatrix(parsedBook, text);
  }

  //  word of God
  setAsWordOfGod(input: HTMLInputElement, segments: Array<WordSegment>): void {
    this.projectMetadataService.setAsWordOfGod(
      input.checked,
      this.projectData[this.metadataEditor.source],
      this.getCurrent(this.sourceVerse.verse.index),
      this.sourceVerse,
      segments
    );
  }

  getScriptureMetadataWordOfGod(segments: Array<WordSegment>): boolean {
    return this.projectMetadataService.getScriptureMetadataWordOfGod(
      this.projectData[this.metadataEditor.source],
      this.getCurrent(this.sourceVerse.verse.index),
      segments
    );
  }

  cleanWordOfGodFromVerse(): void {
    if (!confirm('Confirm clean words set as "word of God"?')) {
      return;
    }

    this.projectMetadataService.cleanWordOfGodFromVerse(this.data, this.getCurrent(this.sourceVerse.verse.index));
  }

  //  metadata
  getScriptureMetadataDefinedKind(segment: WordSegment): '' | 'godname' | 'keyword' | 'character' | 'amount' {
    return this.projectMetadataService.getScriptureMetadataDefinedKind(this.data, this.getCurrent(this.sourceVerse.verse.index), segment);
  }

  updateScripturesMetadata(select: HTMLSelectElement, source: SourceVerse, segment: WordSegment): void {
    this.projectMetadataService.updateScripturesMetadata(this.data, this.getCurrent(source.verse.index), select.value, source, segment);
  }

  cleanScriptureMetadata(sourceVerseIndex: number): void {
    if (!confirm('remove metadata?')) {
      return;
    }

    this.projectMetadataService.cleanScriptureMetadata(this.data, this.getCurrent(sourceVerseIndex));
  }
}
