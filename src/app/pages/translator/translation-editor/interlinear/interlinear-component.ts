import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookInterlinearTarget } from '@domain/book-interlinear-target-model';
import { BookTranslationTarget } from '@domain/book-translation-target-model';
import { CurrentChapter } from '@domain/current-chapter-model';
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
import { ProjectInterlinearService } from '../shared/project/project-interlinear-service';
import { ProjectMetadataService } from '../shared/project/project-metadata-service';
import { TargetTranslationMetadataDetail } from '@domain/target-translation-metadata-detail-model';

@Component({
  selector: 'app-interlinear-component',
  imports: [
    FormsModule,
    LexicalPipe,
    LiteralizatePipe,
    FunctionProxyPipe,
    CustomTranslationComponent,
    AddPatternContextMenuTrigger
  ],
  templateUrl: './interlinear-component.html',
  styleUrl: './interlinear-component.scss'
})
export class InterlinearComponent extends AbstractInspectorDiretive {

  @Input()
  current!: CurrentChapter;

  @Input()
  sourceLanguage!: LanguageUnionType;

  @Input()
  pipeUpdaterController = 0;

  @Input()
  parsedOriginBook!: ParsedBookMetadata;

  @Input()
  originVerse!: SourceVerse;

  @Input()
  sourceBook!: SourceBook;

  @Input()
  parsedBook!: ParsedBookMetadata;

  @Input()
  sourceVerse!: SourceVerse;

  @Input()
  bookTarget!: BookInterlinearTarget;

  @Input()
  customTranslation: BookTranslationTarget | undefined;

  @Input()
  variations: Array<TargetTranslationMetadataDetail> = [];
  
  @Input()
  addPatternMenuRef!: AddPatternContextMenu;

  minified = false;

  constructor(
    private projectService: ProjectDataService,
    protected projectMetadataService: ProjectMetadataService,
    private projectInterlinearService: ProjectInterlinearService
  ) {
    super();
  }

  getTranslationColor(wordIndex: number): string {
    const chapter = this.current.chapter - 1;
    const map = this.bookTarget.chapters[chapter].verses &&
      this.bookTarget.chapters[chapter].verses[this.sourceVerse.verse.index] &&
      this.bookTarget.chapters[chapter].verses[this.sourceVerse.verse.index][wordIndex] || null;

    if (!map) {
      return '0';
    }

    return String(map.origin.index % 7 + 1);
  }

  splitIntoMatrix(parsedBook: ParsedBookMetadata, sourceVerse: SourceVerse): Array<Array<{
    index: number;
    word: string;
  }>> {
    return this.projectService.splitIntoMatrix(parsedBook, sourceVerse.text);
  }

  onSelectInterlinearToBaseScripture(
    translationWordIndex: number,
    translationWord: string,
    interlinearValue: string
  ): void {
    this.projectInterlinearService.onSelectInterlinearToBaseScripture(
      this.bookTarget,
      this.current,
      this.sourceVerse,
      this.sourceVerse,
      translationWordIndex,
      translationWord,
      interlinearValue
    );
  }

  getInterlinear(wordIndex: number): string {
    return this.projectInterlinearService.getInterlinear(
      this.sourceLanguage,
      this.bookTarget,
      this.current,
      this.sourceVerse,
      wordIndex
    );
  }

  castSegmentIntoMetadataIndex(segment: WordSegment) {
    return this.projectService.castSegmentIntoMetadataIndex(this.sourceLanguage, segment);
  }

  cleanTranslationInterlinear() {
    if (!confirm('clean interlinear association for this verse?')) {
      return;
    }

    this.projectInterlinearService.cleanTranslationInterlinear(
      this.bookTarget, this.current, this.sourceVerse
    );
  }
}
