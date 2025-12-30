import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrentChapter } from '@domain/current-chapter-model';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { ProjectData } from '@domain/project-data-model';
import { SourceVerse } from '@domain/source-verse-model';
import { TranslationInterlinear } from '@domain/translation-interlinear-model';
import { WordSegment } from '@domain/word-segment-model';
import { AddPatternContextMenu } from '../../add-pattern-context-menu/add-pattern-context-menu';
import { AddPatternContextMenuTrigger } from '../../add-pattern-context-menu/add-pattern-context-menu-trigger';
import { AbstractInspectorDiretive } from '../abstract-inspector-directive';
import { FunctionProxyPipe } from '../shared/function-proxy-pipe';
import { LexicalPipe } from '../shared/lexical-pipe';
import { LiteralizatePipe } from '../shared/literalizate-pipe';
import { ProjectMetadataService } from '../shared/project/project-metadata-service';
import { ProjectService } from '../shared/project/project-service';
import { ProjectTranslationMetadataService } from '../shared/project/project-translation-metadata-service';

@Component({
  selector: 'app-translation-inspector-component',
  imports: [
    FormsModule,
    LexicalPipe,
    LiteralizatePipe,
    FunctionProxyPipe,
    AddPatternContextMenuTrigger
  ],
  templateUrl: './translation-inspector-component.html',
  styleUrl: './translation-inspector-component.scss'
})
export class TranslationInspectorComponent extends AbstractInspectorDiretive {

  @Input()
  current!: CurrentChapter;

  @Input()
  data!: ProjectData;

  @Input()
  pipeUpdaterController = 0;

  @Input()
  sourceVerse!: SourceVerse;

  @Input()
  translation!: TranslationInterlinear;

  @Input()
  addPatternMenuRef!: AddPatternContextMenu;

  @Input()
  parsedBook!: ParsedBookMetadata;

  constructor(
    private projectService: ProjectService,
    protected projectMetadataService: ProjectMetadataService,
    private projectTranslationMetadataService: ProjectTranslationMetadataService
  ) {
    super();
  }

  getTranslationColor(wordIndex: number): string {
    const map = this.translation.codex[this.current.book].chapters[this.current.chapter][this.sourceVerse.verse.index][wordIndex];
    return String(map.origin.index % 7 + 1);
  }

  splitIntoMatrix(text: string) {
    return this.projectService.splitIntoMatrix(this.parsedBook, text);
  }

  onSelectInterlinearGeezToScripture(
    translationWordIndex: number,
    translationWord: string,
    interlinearValue: string
  ): void {
    this.projectTranslationMetadataService.onSelectInterlinearGeezToScripture(
      this.translation,
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
      this.data.lang.source,
      this.translation,
      this.current,
      this.sourceVerse,
      wordIndex
    );
  }

  castSegmentIntoMetadataIndex(segment: WordSegment) {
    return this.projectService.castSegmentIntoMetadataIndex(this.data.lang.source, segment);
  }

  cleanTranslationInterlinear() {
    if (!confirm('clean interlinear association for this verse?')) {
      return;
    }

    this.projectTranslationMetadataService.cleanTranslationInterlinear(
      this.translation, this.current, this.sourceVerse
    );
  }

}
