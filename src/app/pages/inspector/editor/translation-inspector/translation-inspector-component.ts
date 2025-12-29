import { Component, Input } from '@angular/core';
import { AbstractInspectorDiretive } from '../abstract-inspector-directive';
import { SourceVerse } from '@domain/source-verse-model';
import { TranslationInterlinearVerse } from '@domain/translation-interlinear-verse-model';
import { LiteralizatePipe } from '../../literalizate-pipe';
import { LexicalPipe } from '../../literals-pipe';
import { AddPatternContextMenu } from '../../add-pattern-context-menu/add-pattern-context-menu';
import { AddPatternContextMenuTrigger } from '../../add-pattern-context-menu/add-pattern-context-menu-trigger';
import { ProjectMetadataService } from '@shared/project/project-metadata-service';
import { CurrentChapter } from '@domain/current-chapter-model';
import { ProjectData } from '@domain/project-data-model';
import { TranslationInterlinear } from '@domain/translation-interlinear-model';
import { ProjectTranslationMetadataService } from '@shared/project/project-translation-metadata-service';

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

  constructor(
    protected projectMetadataService: ProjectMetadataService,
    private projectTranslationMetadataService: ProjectTranslationMetadataService
  ) {
    super();
  }

  getTranslationColor(wordIndex: number): string {
    const map = this.translation.codex[this.current.book].chapters[this.current.chapter][this.sourceVerse.verse.index][wordIndex];
    return String(map.origin.index % 7 + 1);
  }

  splitIntoMatrix() {
    this.projectTranslationMetadataService.splitIntoMatrix();
  }

  onSelectInterlinearGeezToScripture() {
    this.projectTranslationMetadataService.onSelectInterlinearGeezToScripture();
  }

  getGeezInterlinear() {
    this.projectTranslationMetadataService.getGeezInterlinear();
  }

  castSegmentIntoMetadataIndex() {
    this.projectTranslationMetadataService.castSegmentIntoMetadataIndex();
  }

  cleanGeezTranslationInterlinear() {
    this.projectTranslationMetadataService.cleanGeezTranslationInterlinear();
  }

}
