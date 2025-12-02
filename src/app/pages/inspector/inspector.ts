import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AsyncModalModule, ModalService } from '@belomonte/async-modal-ngx';
import { AddPatternContextMenu } from './add-pattern-context-menu/add-pattern-context-menu';
import { AddPatternContextMenuTrigger } from './add-pattern-context-menu/add-pattern-context-menu-trigger';
import { DialogDictionary } from './dialog-dictionary/dialog-lexical-dictionary';
import { DialogPatterns } from './dialog-patterns/dialog-patterns';
import { DocumentStorage } from './document-storage';
import { AbstractHolyScriptureModel } from './domain/abstract-holy-scripture-model';
import { HolyScriptureModel } from './domain/holy-scripture-model';
import { InterlinearGeezCustomTranslation } from './domain/interlinear-geez-custom-translation-model';
import { InterlinearGeezGreek } from './domain/interlinear-geez-greek-model';
import { InterlinearGeezHebraic } from './domain/interlinear-geez-hebraic-model';
import { InterlinearGreekCustomTranslation } from './domain/interlinear-greek-custom-translation-model';
import { InterlinearHebraicCustomTranslation } from './domain/interlinear-hebraic-custom-translation-model';
import { NewBook } from './domain/new-book-enum';
import { NewTestmentScriptures } from './domain/new-testment-scriptures-model';
import { OldBook } from './domain/old-book-enum';
import { OldTestmentScriptures } from './domain/old-testment-scriptures-model';
import { ScriptureBook } from './domain/scripture-book-model';
import { ScriptureVerse } from './domain/scripture-verse-model';
import { TranslationBookVerse } from './domain/translation-book-verse-model';
import { Translation } from './domain/translation-model';
import { geezes } from './geezes';
import { GematricsPipe } from './gematrics-pipe';
import { hebraics } from './hebraics';
import { LiteralizatePipe } from './literalizate-pipe';
import { LiteralsPatternsService } from './literals-patterns-service';
import { LexicalPipe } from './literals-pipe';
import { PaleoPipe } from './paleo-pipe';
import { ParsedPatterns } from './parsed-patterns';
import { TranslationService } from './translation-service';
import { TransliterationPipe } from './transliteration-pipe';
import { VersePipe } from './verse-pipe';

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
  styleUrl: './inspector.scss'
})
export class Inspector implements OnInit {

  readonly hebraics = hebraics;
  readonly geezes = geezes;

  readonly bibleChaptersAmount: { [abrev: string]: number } = {
    "gn": 50, "ex": 40, "lv": 27, "nm": 36, "dt": 34, "js": 24, "jz": 21, "rt": 4, "1sm": 31, "2sm": 24, "1rs": 22, "2rs": 25, "1cr": 29, "2cr": 36, "ed": 10, "ne": 13, "et": 10, "jo": 42, "sl": 150, "pv": 31, "ec": 12, "ct": 8, "is": 66, "jr": 52, "lm": 5, "ez": 48, "dn": 12, "os": 14, "jl": 3, "am": 9, "ob": 1, "jn": 4, "mq": 7, "na": 3, "hc": 3, "sf": 3, "ag": 2, "zc": 14, "ml": 4,
    "mt": 28, "mc": 16, "lc": 24, "joao": 21, "atos": 28, "rm": 16, "1co": 16, "2co": 13, "gl": 6, "ef": 6, "fp": 4, "cl": 4, "1ts": 5, "2ts": 3, "1tm": 6, "2tm": 4, "tt": 3, "fm": 1, "hb": 13, "tg": 5, "1pe": 5, "2pe": 3, "1jo": 5, "2jo": 1, "3jo": 1, "jd": 1, "ap": 22
  };

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

  interlinearGeezHebraic: InterlinearGeezHebraic = {
    ...this.createOldTestmentObjectBase()
  };

  interlinearGeezGreek: InterlinearGeezGreek = {
    ...this.createNewTestmentObjectBase()
  };

  interlinearHebraicCustomTranslation: InterlinearHebraicCustomTranslation = {
    ...this.createOldTestmentObjectBase()
  };

  interlinearGreekCustomTranslation: InterlinearGreekCustomTranslation = {
    ...this.createNewTestmentObjectBase()
  };

  interlinearGeezCustomTranslation: InterlinearGeezCustomTranslation = {
    ...this.createOldTestmentObjectBase(),
    ...this.createNewTestmentObjectBase()
  };

  translations: Array<Translation> = [];
  chapterTranslations: Array<Array<TranslationBookVerse>> = [];
  customHebraicTranslation!: OldTestmentScriptures;
  customGreekTranslation!: NewTestmentScriptures;
  customGeezTranslation!: HolyScriptureModel;

  selectedBook: string = '';
  selectedChapter: number | null = null;

  currentBook: OldBook | NewBook = OldBook.GN;
  currentChapter = 0;

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
    this.readCustomTranslation();
    this.readPatterns();
    this.readInterlineares();
    this.subscribeParams();
    this.readSelectedParalelTranslation();
  }

  private readPatterns(): void {
    this.hebraicPatterns = this.documentStorage.getHebraicPattern();
    this.geezPatterns = this.documentStorage.getGeezPattern();
    this.greekPatterns = this.documentStorage.getGreekPattern();
  }

  private readInterlineares(): void {
    const storedInterlinearGeezHebraic = localStorage.getItem('interlinearGeezHebraic');
    if (storedInterlinearGeezHebraic) {
      try {
        this.interlinearGeezHebraic = JSON.parse(storedInterlinearGeezHebraic);
      } catch {

      }
    }

    const storedInterlinearGeezGreek = localStorage.getItem('interlinearGeezGreek');
    if (storedInterlinearGeezGreek) {
      try {
        this.interlinearGeezGreek = JSON.parse(storedInterlinearGeezGreek);
      } catch {

      }
    }
  }

  private readSelectedParalelTranslation(): void {
    const paralels: Array<string> = JSON.parse(localStorage.getItem('paralelTranslations') || '[]');
    localStorage.setItem('paralelTranslations', '[]');
    paralels.forEach(translation => this.loadTranslation(translation));
  }

  private readCustomTranslation(): void {
    const storedCustomHebraicTranslation = localStorage.getItem('customHebraicTranslation');
    if (storedCustomHebraicTranslation) {
      try {
        this.customHebraicTranslation = JSON.parse(storedCustomHebraicTranslation);
      } catch {
        this.customHebraicTranslation = { ...this.createOldTestmentObjectBase() };
      }
    } else {
      this.customHebraicTranslation = { ...this.createOldTestmentObjectBase() };
    }

    const storedCustomGeezTranslation = localStorage.getItem('customGeezTranslation');
    if (storedCustomGeezTranslation) {
      try {
        this.customGeezTranslation = JSON.parse(storedCustomGeezTranslation);
      } catch {
        this.customGeezTranslation = { ...this.createOldTestmentObjectBase(), ...this.createNewTestmentObjectBase() };
      }
    } else {
      this.customGeezTranslation = { ...this.createOldTestmentObjectBase(), ...this.createNewTestmentObjectBase() };
    }

    const storedCustomGreekTranslation = localStorage.getItem('customGreekTranslation');
    if (storedCustomGreekTranslation) {
      try {
        this.customGreekTranslation = JSON.parse(storedCustomGreekTranslation);
      } catch {
        this.customGreekTranslation = { ...this.createNewTestmentObjectBase() };
      }
    } else {
      this.customGreekTranslation = { ...this.createNewTestmentObjectBase() };
    }
  }

  private subscribeParams(): void {
    this.activatedRoute.params.subscribe({
      next: params => {
        this.selectedBook = this.currentBook = params['book'];
        this.selectedChapter = this.currentChapter = Number(params['chapter']) - 1;
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

  removeTranslationByIndex(index: number): void {
    const paralels = JSON.parse(localStorage.getItem('paralelTranslations') || '[]');
    this.translations.splice(index, 1);
    paralels.splice(index, 1);

    localStorage.setItem('paralelTranslations', JSON.stringify(paralels));
    this.updateChapterTranslation();
  }

  getChapters(): number[] {
    if (!this.selectedBook) return [];
    const count = this.bibleChaptersAmount[this.selectedBook];
    return Array.from({ length: count }, (_, i) => i + 1);
  }

  private createNewTestmentObjectBase(): { [newBook in NewBook]: Array<any> } {
    return {
      'mt': [],
      'mc': [],
      'lc': [],
      'joao': [],
      'atos': [],
      'rm': [],
      '1co': [],
      '2co': [],
      'gl': [],
      'ef': [],
      'fp': [],
      'cl': [],
      '1ts': [],
      '2ts': [],
      '1tm': [],
      '2tm': [],
      'tt': [],
      'fm': [],
      'hb': [],
      'tg': [],
      '1pe': [],
      '2pe': [],
      '1jo': [],
      '2jo': [],
      '3jo': [],
      'jd': [],
      'ap': []
    };
  }

  private createOldTestmentObjectBase(): { [oldBook in OldBook]: Array<any> } {
    return {
      'gn': [],
      'ex': [],
      'lv': [],
      'nm': [],
      'dt': [],
      'js': [],
      'jz': [],
      'rt': [],
      '1sm': [],
      '2sm': [],
      '1rs': [],
      '2rs': [],
      '1cr': [],
      '2cr': [],
      'ed': [],
      'ne': [],
      'et': [],
      'jo': [],
      'sl': [],
      'pv': [],
      'ec': [],
      'ct': [],
      'is': [],
      'jr': [],
      'lm': [],
      'ez': [],
      'dn': [],
      'os': [],
      'jl': [],
      'am': [],
      'ob': [],
      'jn': [],
      'mq': [],
      'na': [],
      'hc': [],
      'sf': [],
      'ag': [],
      'zc': [],
      'ml': []
    };
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
    type: "prefix" | "suffix";
    lang: "hebraic" | "geez" | "greek";
  }): void {
    if (option.lang === 'hebraic') {
      this.hebraicPatterns = this.documentStorage.addHebraicPattern(option.word, option.type);
    } else if (option.lang === 'geez') {
      this.geezPatterns = this.documentStorage.addGeezPattern(option.word, option.type);
    } else if (option.lang === 'greek') {
      this.greekPatterns = this.documentStorage.addGreekPattern(option.word, option.type);
    }
  }

  saveCustomTranslation(): void {
    this.documentStorage.saveHebraicCustomTranslation(this.customHebraicTranslation);
    this.documentStorage.saveGeezCustomTranslation(this.customGreekTranslation);
    this.documentStorage.saveGreekCustomTranslation(this.customGeezTranslation);

    this.customHebraicTranslation = { ...this.customHebraicTranslation };
    this.customGreekTranslation = { ...this.customGreekTranslation };
    this.customGeezTranslation = { ...this.customGeezTranslation };

    this.cd.detectChanges();
  }

  go(): void {
    if (this.selectedBook && this.selectedChapter) {
      this.router.navigate([
        '/book',
        this.selectedBook,
        'chapter',
        this.selectedChapter + 1
      ]);

    }
  }

  next(): void {
    const book = this.activatedRoute.snapshot.paramMap.get('book');
    const chapter = Number(this.activatedRoute.snapshot.paramMap.get('chapter'));

    if (!book || !chapter) return;

    const nextChapter = chapter + 1;

    this.router.navigate([
      '/book',
      book,
      'chapter',
      nextChapter
    ]);
  }

  getCustomTranslationVerse(custom: AbstractHolyScriptureModel, verse: ScriptureVerse): ScriptureVerse | null {
    return custom[this.currentBook] && custom[this.currentBook][this.currentChapter] && custom[this.currentBook][this.currentChapter][verse.verse.index];
  }

  //  FIXME: está lógica poderá ser removida quando o JSON de geez, hebraico e grego forem fundidos em um único JSON
  getCorrespondingGeezVerse(hebraicVerse: ScriptureVerse): Array<ScriptureVerse> {
    const verses = new Array<ScriptureVerse>();
    for (let index = 0; index < this.geezes[this.currentBook][this.currentChapter].length; index++) {
      const geezVerse = this.geezes[this.currentBook][this.currentChapter][index];

      if (
        Number(geezVerse.verse.start) <= Number(hebraicVerse.verse.start) && Number(hebraicVerse.verse.start) <= Number(geezVerse.verse.end) ||
        Number(geezVerse.verse.start) <= Number(hebraicVerse.verse.end) && Number(hebraicVerse.verse.end) <= Number(geezVerse.verse.end)
      ) {
        verses.push(geezVerse);
      }
    }

    return verses;
  }

  calcFieldSize(placeholder: string, value: string): number {
    if (value.length) {
      return Math.floor(value.length * 8.5);
    } else if (placeholder.length) {
      return Math.floor(placeholder.length * 5);
    }

    return 30;
  }

  splitByPatterns(word: string, lang: 'hebraic' | 'geez' | 'greek'): string[] {
    const patterns = lang === 'hebraic' ? this.hebraicPatterns : this.geezPatterns;
    return this.literalsPatternsService.splitByPatterns(patterns, word);
  }

  splitIntoMatrix(text: string, lang: 'hebraic' | 'geez' | 'greek'): { index: number, word: string }[][] {
    let patterns: ParsedPatterns;
    if (lang === 'hebraic') {
      patterns = this.hebraicPatterns;
    } else if (lang === 'geez') {
      patterns = this.geezPatterns;
    } else if (lang === 'greek') {
      patterns = this.greekPatterns;
    }

    let index = 0;
    return text.split(' ').map(word => this.literalsPatternsService.splitByPatterns(patterns, word).map(word => {
      return { index: index++, word };
    }));
  }

  getGeezInterlinear(geezVerse: string, geezWordIndex: number): string {
    if (!this.isOldBookGuard(this.currentBook)) {
      return '';
    }

    try {
      const interlinear = this.interlinearGeezHebraic[this.currentBook][this.currentChapter][Number(geezVerse)][geezWordIndex];
      if (interlinear) {
        return `${interlinear.origin.index}-${interlinear.origin.word}`;
      }
    } catch {

    }

    return '';
  }

  onSelectInterlinearGeezToHebraic(
    hebraicVerse: ScriptureVerse,
    geezVerse: ScriptureVerse,
    geezIndex: number,
    geezWord: string,
    interlinear: string
  ): void {
    const [hIndex, hebraicWord] = interlinear.split('-');
    const hebraicIndex = Number(hIndex);
    const hebraicVerseNumber = Number(hebraicVerse.verse.start);
    const geezVerseNumber = Number(geezVerse.verse.start);

    if (!this.isOldBookGuard(this.currentBook)) {
      return;
    }

    if (!this.interlinearGeezHebraic[this.currentBook][this.currentChapter]) {
      this.interlinearGeezHebraic[this.currentBook][this.currentChapter] = [];
    }

    if (!this.interlinearGeezHebraic[this.currentBook][this.currentChapter][geezVerseNumber]) {
      this.interlinearGeezHebraic[this.currentBook][this.currentChapter][geezVerseNumber] = [];
    }

    this.interlinearGeezHebraic[this.currentBook][this.currentChapter][geezVerseNumber][geezIndex] = {
      origin: {
        verse: hebraicVerseNumber,
        index: hebraicIndex,
        word: hebraicWord
      },

      translation: {
        verse: geezVerseNumber,
        index: geezIndex,
        word: geezWord
      }
    };

    localStorage.setItem('interlinearGeezHebraic', JSON.stringify(this.interlinearGeezHebraic));
  }

  getGeezColor(geezVerse: ScriptureVerse, wordIndex: number): string {
    if (!this.isOldBookGuard(this.currentBook)) {
      return '';
    }

    //  FIXME: revisar comportamento para versiculos compostos
    const verseNumber = Number(geezVerse.verse.start);
    if (
      !this.interlinearGeezHebraic[this.currentBook] ||
      !this.interlinearGeezHebraic[this.currentBook][this.currentChapter] ||
      !this.interlinearGeezHebraic[this.currentBook][this.currentChapter][verseNumber] ||
      !this.interlinearGeezHebraic[this.currentBook][this.currentChapter][verseNumber][wordIndex]
    ) {
      return '';
    }

    const map = this.interlinearGeezHebraic[this.currentBook][this.currentChapter][verseNumber][wordIndex];
    return String(map.origin.index % 7 + 1);
  }

  getCustomTranslationFromHebraicColor(verse: ScriptureVerse, wordIndex: number): string {
    const verseNumber = Number(verse.verse.start);
    if (
      !this.interlinearGeezCustomTranslation[this.currentBook] ||
      !this.interlinearGeezCustomTranslation[this.currentBook][this.currentChapter] ||
      !this.interlinearGeezCustomTranslation[this.currentBook][this.currentChapter][verseNumber] ||
      !this.interlinearGeezCustomTranslation[this.currentBook][this.currentChapter][verseNumber][wordIndex]
    ) {
      return '';
    }

    const map = this.interlinearGeezCustomTranslation[this.currentBook][this.currentChapter][verseNumber][wordIndex];
    return String(map.origin.index % 7 + 1);
  }

  getCustomTranslationFromGeezColor(verse: ScriptureVerse, wordIndex: number): string {
    if (!this.isOldBookGuard(this.currentBook)) {
      return '';
    }

    const verseNumber = Number(verse.verse.start);
    if (
      !this.interlinearHebraicCustomTranslation[this.currentBook] ||
      !this.interlinearHebraicCustomTranslation[this.currentBook][this.currentChapter] ||
      !this.interlinearHebraicCustomTranslation[this.currentBook][this.currentChapter][verseNumber] ||
      !this.interlinearHebraicCustomTranslation[this.currentBook][this.currentChapter][verseNumber][wordIndex]
    ) {
      return '';
    }

    const map = this.interlinearHebraicCustomTranslation[this.currentBook][this.currentChapter][verseNumber][wordIndex];
    return String(map.origin.index % 7 + 1);
  }

  getCustomTranslationFromGreekColor(verse: ScriptureVerse, wordIndex: number): string {
    if (!this.isNewBookGuard(this.currentBook)) {
      return '';
    }

    const verseNumber = Number(verse.verse.start);
    if (
      !this.interlinearGreekCustomTranslation[this.currentBook] ||
      !this.interlinearGreekCustomTranslation[this.currentBook][this.currentChapter] ||
      !this.interlinearGreekCustomTranslation[this.currentBook][this.currentChapter][verseNumber] ||
      !this.interlinearGreekCustomTranslation[this.currentBook][this.currentChapter][verseNumber][wordIndex]
    ) {
      return '';
    }

    const map = this.interlinearGreekCustomTranslation[this.currentBook][this.currentChapter][verseNumber][wordIndex];
    return String(map.origin.index % 7 + 1);
  }

  getCustomTranslationFromHebraicSacredRule(verse: ScriptureVerse, wordIndex: number): string {
    return 'GodName';
  }

  getCustomTranslationFromGreekSacredRule(verse: ScriptureVerse, wordIndex: number): string {
    return 'GodName';
  }

  getCustomTranslationFromGeezSacredRule(verse: ScriptureVerse, wordIndex: number): string {
    return 'GodName';
  }

  onChangeCustomTranslationHebraicInterlinear(value: string, book: OldBook, chapter: number, hebraicVerse: ScriptureVerse, index: number): void {

  }

  onChangeCustomTranslationGreekInterlinear(value: string, book: OldBook | NewBook, chapter: number, greekVerse: ScriptureVerse, index: number): void {

  }

  onChangeCustomTranslationGeezInterlinear(value: string, book: NewBook, chapter: number, geezVerse: ScriptureVerse, index: number): void {

  }

  splitTextBySpacesAndPunctuation(value: string): string[] {
    return [...value.matchAll(/(\s*)(\S+?)(\.{3}|…|[.!?]+)?(?=\s|$)/g)]
      .flatMap(m => m[3] ? [`${m[1]}${m[2]}`, m[3]] : [`${m[1]}${m[2]}`]);
  }

  updateLiteral(input: HTMLInputElement, word: string, lang: 'hebraic' | 'geez' | 'greek'): void {
    if (lang === 'hebraic') {
      this.documentStorage.addHebraicLexical(word, input.value);
    } else if (lang === 'geez') {
      this.documentStorage.addGeezLexical(word, input.value);
    }

    input.style.width = `${this.calcFieldSize(word, input.value)}px`;
    this.pipeUpdaterController++;
  }

  isOldBookGuard(book: OldBook | NewBook): book is OldBook {
    const values: string[] = Object.values(OldBook);
    return values.includes(book);
  }

  isNewBookGuard(book: OldBook | NewBook): book is NewBook {
    const values: string[] = Object.values(NewBook);
    return values.includes(book);
  }

  updateCustomTranslation(input: HTMLInputElement, verse: ScriptureVerse, lang: 'hebraic' | 'geez' | 'greek'): void {
    let customTranslation: AbstractHolyScriptureModel, customBook: ScriptureBook;
    const book = this.currentBook;
    const chapter = this.currentChapter;

    if (lang === 'hebraic' && this.isOldBookGuard(book)) {
      customTranslation = this.customHebraicTranslation;
      customBook = customTranslation[book];
    } else if (lang === 'geez') {
      customTranslation = this.customGeezTranslation;
      customBook = customTranslation[String(book)];
    } else if (lang === 'greek' && this.isNewBookGuard(book)) {
      customTranslation = this.customGreekTranslation;
      customBook = customTranslation[book];
    } else {
      throw new Error('language not found');
    }

    if (!customBook) {
      customTranslation[book] = customBook = [];
    }

    if (!customBook[chapter]) {
      customBook[chapter] = [];
    }

    customBook[chapter][verse.verse.index] = {
      ...verse,
      text: input.value
    };

    if (lang === 'hebraic') {
      this.documentStorage.saveHebraicCustomTranslation(customTranslation);
    } else if (lang === 'geez') {
      this.documentStorage.saveGeezCustomTranslation(customTranslation);
    } else if (lang === 'greek') {
      this.documentStorage.saveGreekCustomTranslation(customTranslation);
    }
  }
}
