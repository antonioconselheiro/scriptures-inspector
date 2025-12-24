import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractScriptureVerse } from '../../domain/abstract-scripture-verse-model';
import { Language } from '../../domain/language-model';
import { TranslationBookVerse } from '../../domain/translation-book-verse-model';
import { LiteralsPatternsService } from '../../literals-patterns-service';
import { ParsedPatterns } from '../../parsed-patterns';
import { FunctionProxyPipe } from '../shared/function-proxy-pipe';
import { VersePipe } from '../shared/verse-pipe';
import { AddPatternContextMenuTrigger } from '../../add-pattern-context-menu/add-pattern-context-menu-trigger';
import { AddPatternContextMenu } from '../../add-pattern-context-menu/add-pattern-context-menu';

@Component({
  selector: 'app-scripture-inspector',
  imports: [
    VersePipe,
    FunctionProxyPipe,
    AddPatternContextMenuTrigger
  ],
  templateUrl: './scripture-inspector.html',
  styleUrl: './scripture-inspector.scss'
})
export class ScriptureInspector {

  @Input()
  lang!: Language;

  @Input()
  bookName!: string;

  @Input()
  chapter!: number;

  @Input()
  verse!: AbstractScriptureVerse<{ text: string; }>

  @Input()
  patterns!: ParsedPatterns;

  @Input()
  chapterTranslations!: Array<Array<TranslationBookVerse>>;

  @Input()
  addPatternMenuRef!: AddPatternContextMenu;

  @Output()
  showLegend = new EventEmitter<boolean>();

  @Output()
  save = new EventEmitter<Array<TranslationBookVerse>>();

  constructor(
    private literalsPatternsService: LiteralsPatternsService
  ) {}

  splitIntoMatrix(patterns: ParsedPatterns, text: string): Array<Array<{ index: number, word: string }>> {
    let index = 0;
    return text.split(' ').map(word => this.literalsPatternsService.splitByPatterns(patterns, word).map(word => {
      return { index: index++, word };
    }));
  }

  calcFieldSize(placeholder: string, value: string): number {
    if (value.length) {
      return Math.floor(value.length * 8.5);
    } else if (placeholder.length) {
      return Math.floor(placeholder.length * 5);
    }

    return 30;
  }

}
