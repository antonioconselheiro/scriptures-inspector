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
import { ProjectTranslationMetadataService } from '../shared/project/project-translation-metadata-service';

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
  parsedBook!: ParsedBookMetadata;

  @Input()
  sourceBook!: SourceBook;

  @Input()
  sourceVerse!: SourceVerse;

  @Input()
  bookTarget!: BookInterlinearTarget;

  @Input()
  customTranslation: BookTranslationTarget | undefined;
  
  @Input()
  addPatternMenuRef!: AddPatternContextMenu;

  readonly languageMetadataRecord = languageMetadataRecord;

  constructor(
    private projectService: ProjectDataService,
    protected projectMetadataService: ProjectMetadataService,
    private projectTranslationMetadataService: ProjectTranslationMetadataService
  ) {
    super();
  }

  getTranslationColor(wordIndex: number): string {
    const map = this.bookTarget.chapters[this.current.chapter][this.sourceVerse.verse.index][wordIndex];
    return String(map.origin.index % 7 + 1);
  }

  splitIntoMatrix(text: string): Array<Array<{
    index: number;
    word: string;
  }>> {
    return this.projectService.splitIntoMatrix(this.parsedBook, text);
  }

  onSelectInterlinearGeezToScripture(
    translationWordIndex: number,
    translationWord: string,
    interlinearValue: string
  ): void {
    this.projectTranslationMetadataService.onSelectInterlinearGeezToScripture(
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
    return this.projectTranslationMetadataService.getInterlinear(
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

    this.projectTranslationMetadataService.cleanTranslationInterlinear(
      this.bookTarget, this.current, this.sourceVerse
    );
  }

}
