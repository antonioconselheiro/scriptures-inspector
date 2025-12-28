import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CodexBookChapterVerse } from '@domain/codex-book-chapter-verse-model';
import { CodexBookMetadata } from '@domain/codex-book-metadata-model';
import { CurrentChapter } from '@domain/current-chapter-model';
import { CurrentVerseIndex } from '@domain/current-verse-index-model';
import { Language } from '@domain/language-model';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { ProjectData } from '@domain/project-data-model';
import { SourceVerse } from '@domain/source-verse-model';
import { WordSegment } from '@domain/word-segment-model';
import { ProjectMetadataService } from '@shared/project/project-metadata-service';
import { ParsedPatterns } from '../../../../domain/parsed-patterns';
import { AddPatternContextMenu } from '../../add-pattern-context-menu/add-pattern-context-menu';
import { AddPatternContextMenuTrigger } from '../../add-pattern-context-menu/add-pattern-context-menu-trigger';
import { TranslationBookVerse } from '../../domain/translation-book-verse-model';
import { LiteralizatePipe } from '../../literalizate-pipe';
import { LiteralsPatternsService } from '../../literals-patterns-service';
import { LexicalPipe } from '../../literals-pipe';
import { CustomTranslationComponent } from '../custom-translation/custom-translation-component';
import { FunctionProxyPipe } from '../shared/function-proxy-pipe';
import { VersePipe } from '../shared/verse-pipe';

@Component({
  selector: 'app-scripture-inspector-component',
  imports: [
    VersePipe,
    LexicalPipe,
    LiteralizatePipe,
    FunctionProxyPipe,
    CustomTranslationComponent,
    AddPatternContextMenuTrigger
  ],
  templateUrl: './scripture-inspector-component.html',
  styleUrl: './scripture-inspector-component.scss'
})
export class ScriptureInspectorComponent {

  @Input()
  current!: CurrentChapter;

  @Input()
  data!: ProjectData;

  @Input()
  source!: CodexBookChapterVerse<{ text: string; }>

  @Input()
  chapterTranslations!: Array<Array<TranslationBookVerse>>;

  @Input()
  addPatternMenuRef!: AddPatternContextMenu;

  @Output()
  showLegend = new EventEmitter<boolean>();

  pipeUpdaterController = 0;

  constructor(
    private projectMetadataService: ProjectMetadataService,
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
  setAsWordOfGod(input: HTMLInputElement, segments: Array<WordSegment>): void {
    this.projectMetadataService.setAsWordOfGod(input.checked, this.data, this.getCurrent(this.source.verse.index), this.source, segments);
  }

  getScriptureMetadataWordOfGod(segments: Array<WordSegment>): boolean {
    return this.projectMetadataService.getScriptureMetadataWordOfGod(this.data, this.getCurrent(this.source.verse.index), segments);
  }

  cleanWordOfGodFromVerse(): void {
    if (!confirm('Confirm clean words set as "word of God"?')) {
      return;
    }

    this.projectMetadataService.cleanWordOfGodFromVerse(this.data, this.getCurrent(this.source.verse.index));
  }

  //  metadata
  getScriptureMetadataDefinedKind(segment: WordSegment): '' | 'godname' | 'keyword' | 'character' | 'amount' {
    return this.projectMetadataService.getScriptureMetadataDefinedKind(this.data, this.getCurrent(this.source.verse.index), segment);
  }

  updateScripturesMetadata(select: HTMLSelectElement, source: SourceVerse, segment: WordSegment): void {
    this.projectMetadataService.updateScripturesMetadata(this.data, this.getCurrent(source.verse.index), select.value, source, segment);
  }

  cleanScriptureMetadata(sourceVerseIndex: number): void {
    if (!confirm('remove metadata?')) {
      return;
    }

    this.projectMetadataService.cleanScriptureMetadata(this.data, this.getCurrent(sourceVerseIndex));
  }

  parseBook(book: CodexBookMetadata, lang: Language, pipeUpdaterController: number): ParsedBookMetadata {
    pipeUpdaterController;
    const parsedPatterns = this.projectMetadataService.parsePattern(book.patterns, lang);

    return {
      lexical: book.lexical,
      patterns: parsedPatterns
    }
  }

  //  lexical
  updateLexical(input: HTMLInputElement, word: string): void {
    this.projectMetadataService.updateLexical(this.data, this.current.book, word, input.value);

    input.style.width = `${this.calcFieldSize(word, input.value)}px`;
    this.pipeUpdaterController++;
  }

  getLexical(word: string): string {
    return this.projectMetadataService.getLexical(this.data, this.current.book, word);
  }

  cleanLexicalInterlinear(eachWord: Array<Array<{ index: number; word: string; }>>): void {
    if (!confirm('remove lexical interlinear from verse and from all it occurrences?')) {
      return;
    }

    this.projectMetadataService.cleanLexicalInterlinear(this.data, this.current.book, eachWord);
    this.pipeUpdaterController++;
  }
}
