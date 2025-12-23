import { Component, Input } from '@angular/core';
import { AbstractScriptureVerse } from '../../domain/abstract-scripture-verse-model';
import { Language } from '../../domain/language-model';
import { TranslationBookVerse } from '../../domain/translation-book-verse-model';
import { LiteralsPatternsService } from '../../literals-patterns-service';
import { ParsedPatterns } from '../../parsed-patterns';
import { FunctionProxyPipe } from '../shared/function-proxy-pipe';
import { VersePipe } from '../shared/verse-pipe';

@Component({
  selector: 'app-scripture-inspector',
  imports: [
    VersePipe,
    FunctionProxyPipe
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

  constructor(
    private literalsPatternsService: LiteralsPatternsService
  ) {}

  splitIntoMatrix(patterns: ParsedPatterns, text: string): Array<Array<{ index: number, word: string }>> {
    let index = 0;
    return text.split(' ').map(word => this.literalsPatternsService.splitByPatterns(patterns, word).map(word => {
      return { index: index++, word };
    }));
  }

}
