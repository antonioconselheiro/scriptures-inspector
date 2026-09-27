import { Directive, HostListener, Input } from '@angular/core';
import { InterlinearToolsContextMenu } from './interlinear-tools-context-menu';
import { InterlinearTarget } from '@domain/interlinear-target-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { SourceVerse } from '@domain/source-verse-model';
import { Word } from '@domain/word-model';

@Directive({
  selector: '[appInterlinearToolsContextMenuTrigger]'
})
export class InterlinearToolsContextMenuTrigger {

  @Input('appInterlinearToolsContextMenuTrigger')
  contextMenu!: InterlinearToolsContextMenu;
  
  @Input({ required: true })
  sourceLanguage!: LanguageUnionType;
  
  @Input({ required: true })
  interlinearTarget!: InterlinearTarget;
  
  @Input({ required: true })
  originSource!: string;
  
  @Input({ required: true })
  sourceVerse!: SourceVerse;
  
  @Input({ required: true })
  wordMatrix!: Array<Word>;
  
  @Input({ required: true })
  translationWordIndex!: number;
  
  @Input({ required: true })
  translationWord!: string;

  @Input({ required: true })
  interlinearValue!: string;

  @HostListener('contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    event.preventDefault();

    this.contextMenu.x = event.clientX;
    this.contextMenu.y = event.clientY;
    this.contextMenu.visible = true;

    this.contextMenu.contextMenu = this.contextMenu;
    this.contextMenu.sourceLanguage = this.sourceLanguage;
    this.contextMenu.interlinearTarget = this.interlinearTarget;
    this.contextMenu.originSource = this.originSource;
    this.contextMenu.sourceVerse = this.sourceVerse;
    this.contextMenu.wordMatrix = this.wordMatrix;
    this.contextMenu.translationWordIndex = this.translationWordIndex;
    this.contextMenu.translationWord = this.translationWord;
    this.contextMenu.interlinearValue = this.interlinearValue;
  }

  @HostListener('document:click')
  onDocumentClick() {
    if (this.contextMenu) {
      this.contextMenu.visible = false;
    }
  }
}
