import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AsyncModalModule, ModalService } from '@belomonte/async-modal-ngx';
import { CodexBookChapterVerseMetadata } from '../../domain/codex-book-chapter-verse-metadata-model';
import { CodexBookChapterVerse } from '../../domain/codex-book-chapter-verse-model';
import { Codex } from '../../domain/codex-model';
import { newTestamentBookList } from '../../domain/new-testament-books-list';
import { NewTestamentBooksUnion } from '../../domain/new-testament-books-union';
import { oldTestamentBookList } from '../../domain/old-testament-books-list';
import { OldTestamentBooksUnion } from '../../domain/old-testament-books-union';
import { ParsedPatterns } from '../../domain/parsed-patterns';
import { SourceBook } from '../../domain/source-book-model';
import { SourceVerse } from '../../domain/source-verse-model';
import { TranslationInterlinearVerse } from '../../domain/translation-interlinear-verse-model';
import { demassoretifier } from '../../shared/language-metadata/demassoretifier-fn';
import { AddPatternContextMenu } from './add-pattern-context-menu/add-pattern-context-menu';
import { AddPatternContextMenuTrigger } from './add-pattern-context-menu/add-pattern-context-menu-trigger';
import { bookMetadata } from './book-metadata';
import { createNewTestmentObjectBase } from './create-new-testment-fn';
import { createOldTestmentObjectBase } from './create-old-testment-fn';
import { DialogDictionary } from './dialog-dictionary/dialog-lexical-dictionary';
import { DialogPatterns } from './dialog-patterns/dialog-patterns';
import { DocumentStorage } from './document-storage';
import { HolyScriptureModel } from './domain/holy-scripture-model';
import { InterlinearGeezCustomTranslation } from './domain/interlinear-geez-custom-translation-model';
import { InterlinearGeezGreek } from './domain/interlinear-geez-greek-model';
import { InterlinearGeezHebraic } from './domain/interlinear-geez-hebraic-model';
import { InterlinearGreekCustomTranslation } from './domain/interlinear-greek-custom-translation-model';
import { InterlinearHebraicCustomTranslation } from './domain/interlinear-hebraic-custom-translation-model';
import { NewTestmentScriptures } from './domain/new-testment-scriptures-model';
import { OldTestmentScriptures } from './domain/old-testment-scriptures-model';
import { TranslationBookVerse } from './domain/translation-book-verse-model';
import { Translation } from './domain/translation-model';
import { VersePipe } from './editor/shared/verse-pipe';
import { GematricsPipe } from './gematrics-pipe';
import { LiteralizatePipe } from './literalizate-pipe';
import { LiteralsPatternsService } from './literals-patterns-service';
import { LexicalPipe } from './literals-pipe';
import { PaleoPipe } from './paleo-pipe';
import { TranslationService } from './translation-service';
import { TransliterationPipe } from './transliteration-pipe';

@Component({
  selector: 'app-inspector',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PaleoPipe,
    VersePipe,
    GematricsPipe,
    LexicalPipe,
    LiteralizatePipe,
    AsyncModalModule,
    TransliterationPipe,
    AddPatternContextMenu,
    AddPatternContextMenuTrigger
  ],
  providers: [
    DocumentStorage
  ],
  templateUrl: './inspector.html',
  styleUrl: './inspector.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Inspector implements OnInit {

  readonly bookMetadata = bookMetadata;

  selectedHebraicBook: SourceBook | null = null;
  selectedGeezBook: SourceBook | null = null;
  selectedGreekBook: SourceBook | null = null;

  hebraicPatterns: ParsedPatterns = {
    prefix: new Map(),
    suffix: new Map()
  };

  geezPatterns: ParsedPatterns = {
    prefix: new Map(),
    suffix: new Map()
  };

  greekPatterns: ParsedPatterns = {
    prefix: new Map(),
    suffix: new Map()
  };

  hebraicMetadata!: Codex<{}, CodexBookChapterVerse<CodexBookChapterVerseMetadata>>;
  greekMetadata!: Codex<{}, CodexBookChapterVerse<CodexBookChapterVerseMetadata>>;

  interlinearGeezHebraic: InterlinearGeezHebraic = {
    ...createOldTestmentObjectBase()
  };

  interlinearGeezGreek: InterlinearGeezGreek = {
    ...createNewTestmentObjectBase()
  };

  interlinearHebraicCustomTranslation: InterlinearHebraicCustomTranslation = {
    ...createOldTestmentObjectBase()
  };

  interlinearGreekCustomTranslation: InterlinearGreekCustomTranslation = {
    ...createNewTestmentObjectBase()
  };

  interlinearGeezCustomTranslation: InterlinearGeezCustomTranslation = {
    ...createOldTestmentObjectBase(),
    ...createNewTestmentObjectBase()
  };

  translations: Array<Translation> = [];
  chapterTranslations: Array<Array<TranslationBookVerse>> = [];
  customHebraicTranslation!: OldTestmentScriptures<{ metadata?: string[] }>;
  customGreekTranslation!: NewTestmentScriptures<{ metadata?: string[] }>;
  customGeezTranslation!: HolyScriptureModel<{ metadata?: string[] }>;

  selectedBook: string = '';
  selectedChapter: number | null = null;

  currentBook: OldTestamentBooksUnion | NewTestamentBooksUnion = 'GEN';
  currentChapter = 0;

  showLegend = false;
  minimized = true;
  pipeUpdaterController = 1;

  constructor(
    private router: Router,
    private cd: ChangeDetectorRef,
    private modalService: ModalService,
    private activatedRoute: ActivatedRoute,
    private documentStorage: DocumentStorage,
    private translationService: TranslationService,
    private literalsPatternsService: LiteralsPatternsService
  ) { }

  ngOnInit(): void {
    this.readMetadata();
    this.readCustomTranslation();
    this.readPatterns();
    this.readInterlineares();
    this.subscribeData();
    this.subscribeParams();
    this.readSelectedParalelTranslation();
  }

  private readMetadata(): void {
    this.hebraicMetadata = this.documentStorage.getHebraicMetadata();
    this.greekMetadata = this.documentStorage.getGreekMetadata();
  }

  private readPatterns(): void {
    this.hebraicPatterns = this.documentStorage.getHebraicPattern();
    this.geezPatterns = this.documentStorage.getGeezPattern();
    this.greekPatterns = this.documentStorage.getGreekPattern();
  }

  private readInterlineares(): void {
    this.interlinearGeezHebraic = this.documentStorage.getInterlinearGeezHebraic();
    this.interlinearGeezGreek = this.documentStorage.getInterlinearGeezGreek();
  }

  private readSelectedParalelTranslation(): void {
    const paralels: Array<string> = JSON.parse(localStorage.getItem('paralelTranslations') || '[]');
    localStorage.setItem('paralelTranslations', '[]');
    paralels.forEach(translation => this.loadTranslation(translation));
  }

  private readCustomTranslation(): void {
    this.customHebraicTranslation = this.documentStorage.getCustomHebraicTranslation();
    this.customGreekTranslation = this.documentStorage.getCustomGreekTranslation();
    this.customGeezTranslation = this.documentStorage.getCustomGeezTranslation();
  }

  private subscribeParams(): void {
    this.activatedRoute.params.subscribe({
      next: params => {
        this.selectedBook = this.currentBook = params['book'].toUpperCase();
        this.selectedChapter = this.currentChapter = Number(params['chapter']) - 1;

        this.updateChapterTranslation();
      }
    });
  }

  private subscribeData(): void {
    this.activatedRoute.data.subscribe({
      next: data => {
        this.selectedHebraicBook = data['hebraic'];
        this.selectedGeezBook = data['geez'];
        this.selectedGreekBook = data['greek'];

        this.updateChapterTranslation();
      }
    });
  }

  private updateChapterTranslation(): void {
    this.chapterTranslations = this.translations.map(translation => {
      return this.translationService.getChapter(translation, this.currentBook, this.currentChapter);
    });
    this.cd.detectChanges();
  }

  loadTranslation(bible: string): void {
    const paralels = JSON.parse(localStorage.getItem('paralelTranslations') || '[]');
    if (paralels.includes(bible)) {
      return;
    }

    localStorage.setItem('paralelTranslations', JSON.stringify([...paralels, bible]));
    fetch(`https://antonioconselheiro.github.io/bible/src/${bible}`)
      .then(res => res.json())
      .then(translation => {
        this.translations = [...this.translations, translation];
        this.updateChapterTranslation();
      });
  }

  cleanTranslationByIndex(index: number): void {
    const paralels = JSON.parse(localStorage.getItem('paralelTranslations') || '[]');
    this.translations.splice(index, 1);
    paralels.splice(index, 1);

    localStorage.setItem('paralelTranslations', JSON.stringify(paralels));
    this.updateChapterTranslation();
  }

  getChapters(): number[] {
    if (!this.selectedBook) return [];
    const metadata = this.bookMetadata[this.selectedBook];
    return Array.from({ length: metadata.chapters }, (_, i) => i + 1);
  }

  openDialogPatterns(lang: 'hebraic' | 'geez' | 'greek'): void {
    let patterns: ParsedPatterns | null = null;
    if (lang === 'hebraic') {
      patterns = this.hebraicPatterns
    } else if (lang === 'geez') {
      patterns = this.geezPatterns
    } else if (lang === 'greek') {
      patterns = this.greekPatterns
    }

    if (patterns) {
      this.modalService
        .createModal(DialogPatterns)
        .setOutletName('main')
        .setData({
          lang,
          patterns
        })
        .build()
        .subscribe({
          next: () => this.readPatterns()
        });
    }
  }

  openDictionary(lang: 'hebraic' | 'geez' | 'greek'): void {
    if (lang === 'hebraic') {
      open('https://hebraico.pro.br/r/bibliainterlinear/texto.asp?g=1%2C2&gb=1e2%2C2&s=GENESIS&p=1&sa=s', '_BLANK');
    } else if (lang === 'geez') {
      open('https://www.geezexperience.com/index.php', '_BLANK');
    } else if (lang === 'greek') {
      alert('greek dictionary not configured yet');
    }
  }

  openDialogDictionary(lang: 'hebraic' | 'geez' | 'greek'): void {
    this.modalService
      .createModal(DialogDictionary)
      .setOutletName('main')
      .setData({
        lang
      })
      .build()
      .subscribe({
        next: () => this.readInterlineares()
      });
  }

  onAddPattern(option: {
    word: string;
    type: 'prefix' | 'suffix';
    lang: 'hebraic' | 'geez' | 'greek';
  }): void {
    if (option.lang === 'hebraic') {
      this.hebraicPatterns = this.documentStorage.addHebraicPattern(demassoretifier(option.word), option.type);
    } else if (option.lang === 'geez') {
      this.geezPatterns = this.documentStorage.addGeezPattern(option.word, option.type);
    } else if (option.lang === 'greek') {
      this.greekPatterns = this.documentStorage.addGreekPattern(option.word, option.type);
    }
  }

  go(): void {
    if (this.selectedBook && this.selectedChapter) {
      this.router.navigate([
        '/book',
        this.selectedBook.toLowerCase(),
        'chapter',
        (+this.selectedChapter) + 1
      ]);
    }
  }

  back(): void {
    const book = this.activatedRoute.snapshot.paramMap.get('book');
    const chapter = Number(this.activatedRoute.snapshot.paramMap.get('chapter'));

    if (!book || !chapter) return;

    const nextChapter = chapter - 1;

    this.router.navigate([
      '/book',
      book.toLowerCase(),
      'chapter',
      nextChapter
    ]);
  }

  next(): void {
    const book = this.activatedRoute.snapshot.paramMap.get('book');
    const chapter = Number(this.activatedRoute.snapshot.paramMap.get('chapter'));

    if (!book || !chapter) return;

    const nextChapter = chapter + 1;

    this.router.navigate([
      '/book',
      book.toLowerCase(),
      'chapter',
      nextChapter
    ]);
  }

  getCorrespondingGeezVerse(verse: SourceVerse): Array<SourceVerse> {
    if (!this.selectedGeezBook) {
      return [];
    }

    const verses = new Array<SourceVerse>();
    for (let index = 0; index < this.selectedGeezBook[this.currentChapter].length; index++) {
      const geezVerse = this.selectedGeezBook[this.currentChapter][index];

      if (
        Number(geezVerse.verse.start) <= Number(verse.verse.start) && Number(verse.verse.start) <= Number(geezVerse.verse.end) ||
        Number(geezVerse.verse.start) <= Number(verse.verse.end) && Number(verse.verse.end) <= Number(geezVerse.verse.end)
      ) {
        verses.push(geezVerse);
      }
    }

    return verses;
  }

  // TODO: remove 
  calcFieldSize(placeholder: string, value: string): number {
    if (value.length) {
      return Math.floor(value.length * 8.5);
    } else if (placeholder.length) {
      return Math.floor(placeholder.length * 5);
    }

    return 30;
  }

  splitByPatterns(word: string, lang: 'hebraic' | 'geez' | 'greek'): string[] {
    if (lang === 'hebraic') {
      return this.literalsPatternsService.splitByPatterns(this.hebraicPatterns, word);
    } else if (lang === 'greek') {
      return this.literalsPatternsService.splitByPatterns(this.greekPatterns, word);
    } else if (lang === 'geez') {
      return this.literalsPatternsService.splitByPatterns(this.geezPatterns, word);
    } else {
      throw new Error('language not found: ' + lang);
    }
  }

  getGeezInterlinear(geezVerse: SourceVerse, geezWordIndex: number): string {
    let interlinear: TranslationInterlinearVerse;

    try {
      if (this.isOldBookGuard(this.currentBook)) {
        interlinear = this.interlinearGeezHebraic[this.currentBook][this.currentChapter][geezVerse.verse.index][geezWordIndex];
      } else if (this.isNewBookGuard(this.currentBook)) {
        interlinear = this.interlinearGeezGreek[this.currentBook][this.currentChapter][geezVerse.verse.index][geezWordIndex];
      } else {
        return '';
      }

      if (interlinear) {
        return this.castSegmentIntoMetadataIndex(interlinear.origin);
      }
    } catch {

    }

    return '';
  }

  getGeezGreekInterlinear(geezVerse: string, geezWordIndex: number): string {
    if (!this.isNewBookGuard(this.currentBook)) {
      return '';
    }

    try {
      const interlinear = this.interlinearGeezGreek[this.currentBook][this.currentChapter][Number(geezVerse)][geezWordIndex];
      if (interlinear) {
        return this.castSegmentIntoMetadataIndex(interlinear.origin);
      }
    } catch {

    }

    return '';
  }

  onSelectInterlinearGeezToScripture(
    scriptureVerse: SourceVerse,
    geezVerse: SourceVerse,
    geezWordIndex: number,
    geezWord: string,
    interlinear: string,
    lang: 'hebraic' | 'greek'
  ): void {
    const [scriptureWordIndexString, scriptureWord] = interlinear.split('-');
    const scriptureWordIndex = Number(scriptureWordIndexString);
    const scriptureVerseNumber = Number(scriptureVerse.verse.start);
    const geezVerseNumber = Number(geezVerse.verse.start);
    let interlinearMetadata: { [book: string]: TranslationInterlinearVerse[][][] } = {};

    if (lang === 'hebraic' && this.isOldBookGuard(this.currentBook)) {
      interlinearMetadata = this.interlinearGeezHebraic;
    } else if (lang === 'greek' && this.isNewBookGuard(this.currentBook)) {
      interlinearMetadata = this.interlinearGeezGreek;
    } else {
      return;
    }

    if (!interlinearMetadata[this.currentBook]) {
      interlinearMetadata[this.currentBook] = [];
    }

    if (!interlinearMetadata[this.currentBook][this.currentChapter]) {
      interlinearMetadata[this.currentBook][this.currentChapter] = [];
    }

    if (!interlinearMetadata[this.currentBook][this.currentChapter][geezVerse.verse.index]) {
      interlinearMetadata[this.currentBook][this.currentChapter][geezVerse.verse.index] = [];
    }

    interlinearMetadata[this.currentBook][this.currentChapter][geezVerse.verse.index][geezWordIndex] = {
      origin: {
        verse: scriptureVerseNumber,
        index: scriptureWordIndex,
        word: scriptureWord
      },

      translation: {
        verse: geezVerseNumber,
        index: geezWordIndex,
        word: geezWord
      }
    };

    if (lang === 'hebraic') {
      this.interlinearGeezHebraic = this.documentStorage.saveInterlinearGeezHebraic(this.interlinearGeezHebraic);
    } else if (lang === 'greek') {
      this.interlinearGeezGreek = this.documentStorage.saveInterlinearGeezGreek(this.interlinearGeezGreek);
    }
  }

  cleanGeezTranslationInterlinear(geezVerse: SourceVerse, lang: 'hebraic' | 'greek'): void {
    if (!confirm('clean interlinear association for this verse?')) {
      return;
    }

    let interlinearMetadata: { [book: string]: TranslationInterlinearVerse[][][] } = {};

    if (lang === 'hebraic' && this.isOldBookGuard(this.currentBook)) {
      interlinearMetadata = this.interlinearGeezHebraic;
    } else if (lang === 'greek' && this.isNewBookGuard(this.currentBook)) {
      interlinearMetadata = this.interlinearGeezGreek;
    } else {
      return;
    }

    if (
      !interlinearMetadata[this.currentBook] ||
      !interlinearMetadata[this.currentBook][this.currentChapter]
    ) {
      return;
    }

    if (interlinearMetadata[this.currentBook][this.currentChapter][geezVerse.verse.index]) {
      interlinearMetadata[this.currentBook][this.currentChapter][geezVerse.verse.index] = [];
    }

    if (lang === 'hebraic') {
      this.interlinearGeezHebraic = this.documentStorage.saveInterlinearGeezHebraic(this.interlinearGeezHebraic);
    } else if (lang === 'greek') {
      this.interlinearGeezGreek = this.documentStorage.saveInterlinearGeezGreek(this.interlinearGeezGreek);
    }
  }

  getGeezColor(geezVerse: SourceVerse, wordIndex: number): string {
    let interlinearMetadata: { [book: string]: TranslationInterlinearVerse[][][] } = {};
    const currentBook = this.currentBook;
    if (this.isOldBookGuard(currentBook)) {
      interlinearMetadata = this.interlinearGeezHebraic;
    } else if (this.isNewBookGuard(currentBook)) {
      interlinearMetadata = this.interlinearGeezGreek;
    } else {
      return '';
    }

    const verseIndex = Number(geezVerse.verse.index);
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

  getGeezCustomTranslationColor(verse: SourceVerse, wordIndex: number): string {
    let interlinearMetadata: { [book: string]: TranslationInterlinearVerse[][][] } = {};
    const book = this.currentBook;
    if (this.isOldBookGuard(book)) {
      interlinearMetadata = this.interlinearGeezHebraic;
    } else if (this.isNewBookGuard(book)) {
      interlinearMetadata = this.interlinearGeezGreek;
    } else {
      return '';
    }

    const geezMetadata = this.customGeezTranslation[book] &&
      this.customGeezTranslation[book][this.currentChapter] &&
      this.customGeezTranslation[book][this.currentChapter][verse.verse.index]?.metadata?.[wordIndex] || '';

    const [geezWordIndex] = Array.from(geezMetadata.match(/^\d+/) || ['']);
    if (!geezWordIndex) {
      return '';
    }

    const verseIndex = Number(verse.verse.index);
    if (
      !interlinearMetadata[book] ||
      !interlinearMetadata[book][this.currentChapter] ||
      !interlinearMetadata[book][this.currentChapter][verseIndex] ||
      !interlinearMetadata[book][this.currentChapter][verseIndex][Number(geezWordIndex)]
    ) {
      return '';
    }

    const map = interlinearMetadata[book][this.currentChapter][verseIndex][Number(geezWordIndex)];
    return String(map.origin.index % 7 + 1);
  }

  isOldBookGuard(book: OldTestamentBooksUnion | NewTestamentBooksUnion): book is OldTestamentBooksUnion {
    return (oldTestamentBookList as string[]).includes(book);
  }

  isNewBookGuard(book: OldTestamentBooksUnion | NewTestamentBooksUnion): book is NewTestamentBooksUnion {
    return (newTestamentBookList as string[]).includes(book);
  }


}
