import { Component, Input } from '@angular/core';
import { CurrentChapter } from '@domain/current-chapter-model';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { ProjectData } from '@domain/project-data-model';
import { SourceVerse } from '@domain/source-verse-model';
import { TranslationInterlinear } from '@domain/translation-interlinear-model';
import { WordSegment } from '@domain/word-segment-model';
import { ProjectMetadataService } from '@shared/project/project-metadata-service';
import { ProjectService } from '@shared/project/project-service';
import { ProjectTranslationMetadataService } from '@shared/project/project-translation-metadata-service';
import { AddPatternContextMenu } from '../../add-pattern-context-menu/add-pattern-context-menu';
import { AddPatternContextMenuTrigger } from '../../add-pattern-context-menu/add-pattern-context-menu-trigger';
import { LiteralizatePipe } from '../../literalizate-pipe';
import { LexicalPipe } from '../../literals-pipe';
import { AbstractInspectorDiretive } from '../abstract-inspector-directive';

@Component({
  selector: 'app-translation-inspector-component',
  imports: [
    LexicalPipe,
    LiteralizatePipe,
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
      this.translation,
      this.current,
      this.sourceVerse,
      wordIndex
    );
  }

  castSegmentIntoMetadataIndex(segment: WordSegment) {
    return this.projectService.castSegmentIntoMetadataIndex(this.data.lang.source, segment);
  }

  cleanGeezTranslationInterlinear() {
    if (!confirm('clean interlinear association for this verse?')) {
      return;
    }

    this.projectTranslationMetadataService.cleanGeezTranslationInterlinear(
      this.translation, this.current, this.sourceVerse
    );
  }

}
