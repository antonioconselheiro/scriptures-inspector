import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookMetadataTarget } from '@domain/book-metadata-target-model';
import { BookTranslationTarget } from '@domain/book-translation-target-model';
import { BookVerse } from '@domain/book-verse-model';
import { CurrentChapter } from '@domain/current-chapter-model';
import { CurrentVerseIndex } from '@domain/current-verse-index-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { SourceBook } from '@domain/source-book-model';
import { TranslationViewing } from '@domain/translation-viewing-model';
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

@Component({
  selector: 'app-scripture-metadata-component',
  imports: [
    LexicalPipe,
    FormsModule,
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
  verseIndex!: number;

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
  removeTranslation = new EventEmitter<string>();

  minified = false;

  constructor(
    private projectService: ProjectDataService,
    protected projectMetadataService: ProjectMetadataService
  ) {
    super();
  }

  private getCurrent(currentIndex: number): CurrentVerseIndex {
    return { ...this.current, verseIndex: currentIndex };
  }

  getTranslations(
    viewingTranslationBookRecord: {
      readonly [source: string]: TranslationViewing;
    }
  ): Array<{
    source: string;
    name: string;
    verses: Readonly<BookVerse<{
      text: string;
    }>>[];
  }> {
    const indexNotFound = -1;
    return Object.keys(viewingTranslationBookRecord).map(source => {
      const chapterIndex = viewingTranslationBookRecord[source].chapters.findIndex(chapter => chapter.chapter === this.current.chapter);
      const name = viewingTranslationBookRecord[source].name;

      if (chapterIndex !== indexNotFound) {
        const verses = viewingTranslationBookRecord[source].chapters[chapterIndex].verses;
        
        return {
          source,
          name,
          verses
        }
      } else {
        return {
          source,
          name,
          verses: []
        }
      }
    });
  }

  removeTranslationViewing(source: string): void {
    this.removeTranslation.emit(source);
  }

  splitIntoMatrix(text: string): Array<Array<{
    index: number;
    word: string;
  }>> {
    const language = this.languageMetadataRecord[this.sourceLanguage];
    return this.projectService.splitIntoMatrix(language, this.parsedBook, text);
  }

  splitByLanguageWordSeparator(text: string): Array<string> {
    const language = this.languageMetadataRecord[this.sourceLanguage];
    return this.projectService.splitByLanguageWordSeparator(language, text);
  }

  //  word of God
  setAsWordOfGod(
    input: HTMLInputElement,
    eachWord: Array<Array<{ index: number; word: string; }>>,
    wordIndex: number
  ): void {
    const segments: Array<WordSegment> = eachWord[wordIndex];
    this.projectMetadataService.removeUnusedMetadata(
      this.bookTarget,
      this.sourceLanguage,
      this.getCurrent(this.verseIndex),
      this.sourceVerse,
      eachWord,
      wordIndex
    );

    this.projectMetadataService.setAsWordOfGod(
      input.checked,
      this.bookTarget,
      this.sourceLanguage,
      this.getCurrent(this.verseIndex),
      this.sourceVerse,
      segments
    );
  }

  getScriptureMetadataWordOfGod(
    eachWord: Array<Array<{ index: number; word: string; }>>,
    wordIndex: number
  ): boolean {
    const segments: Array<WordSegment> = eachWord[wordIndex];
    return this.projectMetadataService.getScriptureMetadataWordOfGod(
      this.bookTarget,
      this.sourceLanguage,
      this.getCurrent(this.verseIndex),
      segments
    );
  }

  cleanWordOfGodFromVerse(): void {
    if (!confirm('Confirm clean words set as "word of God"?')) {
      return;
    }

    this.projectMetadataService.cleanWordOfGodFromVerse(this.bookTarget, this.getCurrent(this.verseIndex));
  }
}
