import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CodexBookChapterVerse } from '@domain/codex-book-chapter-verse-model';
import { CurrentChapter } from '@domain/current-chapter-model';
import { CurrentVerseIndex } from '@domain/current-verse-index-model';
import { ProjectData } from '@domain/project-data-model';
import { SourceVerse } from '@domain/source-verse-model';
import { WordSegment } from '@domain/word-segment-model';
import { ProjectService } from '@shared/project/project-service';
import { AddPatternContextMenu } from '../../add-pattern-context-menu/add-pattern-context-menu';
import { AddPatternContextMenuTrigger } from '../../add-pattern-context-menu/add-pattern-context-menu-trigger';
import { TranslationBookVerse } from '../../domain/translation-book-verse-model';
import { LiteralizatePipe } from '../../literalizate-pipe';
import { LiteralsPatternsService } from '../../literals-patterns-service';
import { LexicalPipe } from '../../literals-pipe';
import { ParsedPatterns } from '../../../../domain/parsed-patterns';
import { FunctionProxyPipe } from '../shared/function-proxy-pipe';
import { VersePipe } from '../shared/verse-pipe';
import { Language } from '@domain/language-model';
import { PatternsSerialized } from '@domain/patterns-serialized';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { CodexBookMetadata } from '@domain/codex-book-metadata-model';

@Component({
  selector: 'app-scripture-inspector',
  imports: [
    VersePipe,
    LexicalPipe,
    LiteralizatePipe,
    FunctionProxyPipe,
    AddPatternContextMenuTrigger
  ],
  templateUrl: './scripture-inspector.html',
  styleUrl: './scripture-inspector.scss'
})
export class ScriptureInspector {

  @Input()
  current!: CurrentChapter;

  @Input()
  data!: ProjectData;

  @Input()
  verse!: CodexBookChapterVerse<{ text: string; }>

  @Input()
  patterns!: ParsedPatterns;

  @Input()
  chapterTranslations!: Array<Array<TranslationBookVerse>>;

  @Input()
  addPatternMenuRef!: AddPatternContextMenu;

  @Output()
  showLegend = new EventEmitter<boolean>();

  pipeUpdaterController = 0;

  constructor(
    private projectService: ProjectService,
    private literalsPatternsService: LiteralsPatternsService
  ) { }

  private getCurrent(currentIndex: number): CurrentVerseIndex {
    return { ...this.current, verseIndex: currentIndex };
  }

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

  //  word of God
  setAsWordOfGod(input: HTMLInputElement, targetVerseIndex: number, sourceVerse: SourceVerse, segments: Array<WordSegment>): void {
    this.projectService.setAsWordOfGod(input.checked, this.data, this.getCurrent(targetVerseIndex), sourceVerse, segments);
  }

  getScriptureMetadataWordOfGod(targetVerseIndex: number, segments: Array<WordSegment>): boolean {
    return this.projectService.getScriptureMetadataWordOfGod(this.data, this.getCurrent(targetVerseIndex), segments);
  }

  cleanWordOfGodFromVerse(targetVerseIndex: number): void {
    if (!confirm('Confirm clean words set as "word of God"?')) {
      return;
    }

    this.projectService.cleanWordOfGodFromVerse(this.data, this.getCurrent(targetVerseIndex));
  }

  //  metadata
  getScriptureMetadataDefinedKind(targetVerseIndex: number, segment: WordSegment): '' | 'godname' | 'keyword' | 'character' | 'amount' {
    return this.projectService.getScriptureMetadataDefinedKind(this.data, this.getCurrent(targetVerseIndex), segment);
  }

  updateScripturesMetadata(select: HTMLSelectElement, targetVerseIndex: number, verse: SourceVerse, segment: WordSegment): void {
    this.projectService.updateScripturesMetadata(this.data, this.getCurrent(targetVerseIndex), select.value, verse, segment);
  }

  cleanScriptureMetadata(sourceVerseIndex: number): void {
    if (!confirm('remove metadata?')) {
      return;
    }

    this.projectService.cleanScriptureMetadata(this.data, this.getCurrent(sourceVerseIndex));
  }

  parseBook(book: CodexBookMetadata, lang: Language, pipeUpdaterController: number): ParsedBookMetadata {
    pipeUpdaterController;
    const parsedPatterns = this.projectService.parsePattern(book.patterns, lang);

    return {
      lexical: book.lexical,
      patterns: parsedPatterns
    }
  }

  //  lexical
  updateLexical(input: HTMLInputElement, word: string): void {
    this.projectService.updateLexical(this.data, this.current.book, word, input.value);

    input.style.width = `${this.calcFieldSize(word, input.value)}px`;
    this.pipeUpdaterController++;
  }

  getLexical(word: string): string {
    return this.projectService.getLexical(this.data, this.current.book, word);
  }

  cleanLexicalInterlinear(eachWord: Array<Array<{ index: number; word: string; }>>): void {
    if (!confirm('remove lexical interlinear from verse and from all it occurrences?')) {
      return;
    }

    this.projectService.cleanLexicalInterlinear(this.data, this.current.book, eachWord);
    this.pipeUpdaterController++;
  }
}
