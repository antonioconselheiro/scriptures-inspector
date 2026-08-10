import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookMetadataTarget } from '@domain/book-metadata-target-model';
import { BookTranslationTarget } from '@domain/book-translation-target-model';
import { BookVerse } from '@domain/book-verse-model';
import { CurrentChapter } from '@domain/current-chapter-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { ProjectData } from '@domain/project-data-model';
import { Project } from '@domain/project-model';
import { ProjectStructureInterlinear } from '@domain/project-structure-interlinear-model';
import { ProjectStructureMetadata } from '@domain/project-structure-metadata-model';
import { SourceBook } from '@domain/source-book-model';
import { TranslationViewing } from '@domain/translation-viewing-model';
import { Word } from '@domain/word-model';
import { SystemService } from '@shared/system/system-service';
import { AddPatternContextMenu } from '../../add-pattern-context-menu/add-pattern-context-menu';
import { AddPatternContextMenuTrigger } from '../../add-pattern-context-menu/add-pattern-context-menu-trigger';
import { CustomTranslationComponent } from '../custom-translation/custom-translation-component';
import { InterlinearComponent } from '../interlinear/interlinear-component';
import { AbstractTranslatableDirective } from '../shared/abstract-translatable-directive';
import { FunctionProxyPipe } from '../shared/function-proxy-pipe';
import { LexicalPipe } from '../shared/lexical-pipe';
import { ProjectDataService } from '../shared/project/project-data-service';
import { ProjectMetadataService } from '../shared/project/project-metadata-service';
import { ParsedPatterns } from '@domain/parsed-patterns';
import { Codex } from '@domain/codex-model';

@Component({
  selector: 'app-scripture-metadata-component',
  imports: [
    LexicalPipe,
    FormsModule,
    FunctionProxyPipe,
    InterlinearComponent,
    CustomTranslationComponent,
    AddPatternContextMenuTrigger
  ],
  templateUrl: './scripture-metadata-component.html',
  styleUrl: './scripture-metadata-component.scss'
})
export class ScriptureMetadataComponent extends AbstractTranslatableDirective {

  @Input()
  title = 'Metadata';

  @Input()
  project!: Project;
  
  @Input()
  projectData: ProjectData = {};
  
  @Input()
  structure!: ProjectStructureMetadata | ProjectStructureInterlinear;

  @Input()
  codexMetadataRecord!: { [source: string]: Codex<LanguageUnionType> };

  @Input()
  wordList: Array<{ word: string; separator?: string; }> | null = null;
  
  @Input()
  wordMatrix: Array<Word> | null = null;

  @Input()
  current!: CurrentChapter;

  @Input()
  pipeUpdaterController = 0;
  
  @Input()
  sourceBook!: SourceBook;

  @Input()
  sourceLanguage!: LanguageUnionType;

  @Input()
  sourceVerse!: BookVerse<{ text: string; }>;

  @Input()
  bookTarget!: BookMetadataTarget;

  @Input()
  customTranslation: BookTranslationTarget | undefined;

  @Input()
  viewingTranslationBookRecord: { [source: string]: TranslationViewing; } = {};

  @Input()
  addPatternMenuRef!: AddPatternContextMenu;

  @Input()
  getColor: (segmentIndex: number) => string = (segmentIndex: number) => String(segmentIndex % 7 + 1);

  minified = false;

  constructor(
    protected dataService: ProjectDataService,
    protected systemService: SystemService,
    protected metadataService: ProjectMetadataService
  ) {
    super();
  }

  splitIntoMatrix(patterns: ParsedPatterns, text: string): Array<Word> {
    const language = this.languageMetadataRecord[this.sourceLanguage];
    return this.dataService.splitIntoMatrix(language, patterns, text);
  }

  //  word of God
  setAsWordOfGod(
    input: HTMLInputElement,
    wordMatrix: Array<Word>,
    wordIndex: number
  ): void {
    const word: Word = wordMatrix[wordIndex];
    this.metadataService.removeUnusedMetadata(
      this.bookTarget,
      this.sourceLanguage,
      this.current,
      this.sourceVerse,
      wordMatrix,
      wordIndex
    );

    this.metadataService.setAsWordOfGod(
      input.checked,
      this.bookTarget,
      this.sourceLanguage,
      this.current,
      this.sourceVerse,
      word
    );
  }

  getScriptureMetadataWordOfGod(
    wordMatrix: Array<Word>,
    wordIndex: number
  ): boolean {
    const word: Word = wordMatrix[wordIndex];
    return this.metadataService.getScriptureMetadataWordOfGod(
      this.bookTarget,
      this.sourceLanguage,
      this.current,
      word
    );
  }

  cleanWordOfGodFromVerse(): void {
    if (!confirm('Confirm clean words set as "word of God"?')) {
      return;
    }

    this.metadataService.cleanWordOfGodFromVerse(this.bookTarget, this.current);
  }
}
