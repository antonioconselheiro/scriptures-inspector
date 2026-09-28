import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CurrentChapter } from '@domain/current-chapter-model';
import { InterlinearTarget } from '@domain/interlinear-target-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { SourceVerse } from '@domain/source-verse-model';
import { Word } from '@domain/word-model';
import { ProjectInterlinearService } from '../translation-editor/shared/project/project-interlinear-service';

@Component({
  selector: 'app-interlinear-tools-context-menu',
  imports: [
    CommonModule
  ],
  templateUrl: './interlinear-tools-context-menu.html',
  styleUrl: './interlinear-tools-context-menu.scss',
})
export class InterlinearToolsContextMenu {

  visible = false;
  x = 0;
  y = 0;

  @Input({ required: true })
  current!: CurrentChapter;
  contextMenu!: InterlinearToolsContextMenu;
  sourceLanguage!: LanguageUnionType;
  interlinearTarget!: InterlinearTarget;
  originSource!: string;
  sourceVerse!: SourceVerse;
  wordMatrix!: Array<Word>;
  originWordMatrix!: Array<Word>;
  translationWordIndex!: number;
  translationWord!: string;
  interlinearValue!: string;

  constructor(
    private interlinearService: ProjectInterlinearService
  ) { }

  onClickFillSequentially(): void {
    this.interlinearService.fillSequentiallyAllAssociationsToTheRight(
      this.sourceLanguage,
      this.interlinearTarget,
      this.originSource,
      this.current,
      this.sourceVerse,
      this.wordMatrix,
      this.originWordMatrix,
      this.translationWordIndex,
      this.interlinearValue
    );
  }

  onClickMoveOneToRight(): void {
    this.interlinearService.moveOneWordToAllAssociationsToTheRight(
      this.sourceLanguage,
      this.interlinearTarget,
      this.originSource,
      this.current,
      this.sourceVerse,
      this.wordMatrix,
      this.translationWordIndex,
      this.translationWord,
      this.interlinearValue
    );
  }

  onClickReturnOneToRight(): void {
    this.interlinearService.returnOneWordToAllAssociationsToTheRight(
      this.sourceLanguage,
      this.interlinearTarget,
      this.originSource,
      this.current,
      this.sourceVerse,
      this.wordMatrix,
      this.translationWordIndex
    );
  }

}
