import { Component, Input } from '@angular/core';
import { AbstractInspectorDiretive } from '../abstract-inspector-directive';
import { SourceVerse } from '@domain/source-verse-model';
import { TranslationInterlinearVerse } from '@domain/translation-interlinear-verse-model';
import { LiteralizatePipe } from '../../literalizate-pipe';
import { LexicalPipe } from '../../literals-pipe';
import { AddPatternContextMenu } from '../../add-pattern-context-menu/add-pattern-context-menu';
import { AddPatternContextMenuTrigger } from '../../add-pattern-context-menu/add-pattern-context-menu-trigger';
import { ProjectMetadataService } from '@shared/project/project-metadata-service';

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
  addPatternMenuRef!: AddPatternContextMenu;

  constructor(
    protected projectMetadataService: ProjectMetadataService
  ) {
    super();
  }

  getTranslationColor(sourceVerse: SourceVerse, wordIndex: number): string {
    let interlinearMetadata: { [book: string]: TranslationInterlinearVerse[][][] } = {};
    const currentBook = this.currentBook;
    if (this.isOldBookGuard(currentBook)) {
      interlinearMetadata = this.interlinearGeezHebraic;
    } else if (this.isNewBookGuard(currentBook)) {
      interlinearMetadata = this.interlinearGeezGreek;
    } else {
      return '';
    }

    const verseIndex = Number(sourceVerse.verse.index);
    if (
      !interlinearMetadata[currentBook] ||
      !interlinearMetadata[currentBook][this.currentChapter] ||
      !interlinearMetadata[currentBook][this.currentChapter][verseIndex] ||
      !interlinearMetadata[currentBook][this.currentChapter][verseIndex][wordIndex]
    ) {
      return '';
    }

    const map = interlinearMetadata[currentBook][this.currentChapter][verseIndex][wordIndex];
    return String(map.origin.index % 7 + 1);
  }
}
