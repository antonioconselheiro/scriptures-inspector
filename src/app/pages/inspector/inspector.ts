import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AsyncModalModule, ModalService } from '@belomonte/async-modal-ngx';
import { newTestamentBookList } from '../../domain/new-testament-books-list';
import { NewTestamentBooksUnion } from '../../domain/new-testament-books-union';
import { oldTestamentBookList } from '../../domain/old-testament-books-list';
import { OldTestamentBooksUnion } from '../../domain/old-testament-books-union';
import { AddPatternContextMenu } from './add-pattern-context-menu/add-pattern-context-menu';
import { AddPatternContextMenuTrigger } from './add-pattern-context-menu/add-pattern-context-menu-trigger';
import { bookMetadata } from './book-metadata';
import { createNewTestmentObjectBase } from './create-new-testment-fn';
import { createOldTestmentObjectBase } from './create-old-testment-fn';
import { demassoretifier } from './demassoretifier-fn';
import { DialogDictionary } from './dialog-dictionary/dialog-lexical-dictionary';
import { DialogPatterns } from './dialog-patterns/dialog-patterns';
import { DocumentStorage } from './document-storage';
import { AbstractCodice } from './domain/abstract-codice-model';
import { AbstractHolyScriptureModel } from './domain/abstract-holy-scripture-model';
import { AbstractScriptureBook } from './domain/abstract-scripture-book-model';
import { AbstractScriptureVerse } from './domain/abstract-scripture-verse-model';
import { HolyScriptureModel } from './domain/holy-scripture-model';
import { InterlinearGeezCustomTranslation } from './domain/interlinear-geez-custom-translation-model';
import { InterlinearGeezGreek } from './domain/interlinear-geez-greek-model';
import { InterlinearGeezHebraic } from './domain/interlinear-geez-hebraic-model';
import { InterlinearGreekCustomTranslation } from './domain/interlinear-greek-custom-translation-model';
import { InterlinearHebraicCustomTranslation } from './domain/interlinear-hebraic-custom-translation-model';
import { NewTestmentScriptures } from './domain/new-testment-scriptures-model';
import { OldTestmentScriptures } from './domain/old-testment-scriptures-model';
import { ScriptureBook } from './domain/scripture-book-model';
import { ScriptureVerseMetadata } from './domain/scripture-verse-metadata-model';
import { ScriptureVerseMetadataWord } from './domain/scripture-verse-metadata-word-model';
import { ScriptureVerse } from './domain/scripture-verse-model';
import { TranslationBookVerse } from './domain/translation-book-verse-model';
import { TranslationInterlinearVerse } from './domain/translation-interlinear-verse-model';
import { Translation } from './domain/translation-model';
import { GematricsPipe } from './gematrics-pipe';
import { LiteralizatePipe } from './literalizate-pipe';
import { LiteralsPatternsService } from './literals-patterns-service';
import { LexicalPipe } from './literals-pipe';
import { PaleoPipe } from './paleo-pipe';
import { ParsedPatterns } from './parsed-patterns';
import { TranslationService } from './translation-service';
import { TransliterationPipe } from './transliteration-pipe';
import { VersePipe } from './editor/shared/verse-pipe';

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

  selectedHebraicBook: ScriptureBook | null = null;
  selectedGeezBook: ScriptureBook | null = null;
  selectedGreekBook: ScriptureBook | null = null;

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

  hebraicMetadata!: AbstractCodice<OldTestamentBooksUnion, AbstractScriptureVerse<ScriptureVerseMetadata>>;
  greekMetadata!: AbstractCodice<NewTestamentBooksUnion, AbstractScriptureVerse<ScriptureVerseMetadata>>;

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

  saveCustomTranslation(lang: 'hebraic' | 'geez' | 'greek'): void {
    if (lang === 'hebraic') {
      this.documentStorage.saveHebraicCustomTranslation(this.customHebraicTranslation);
      this.customHebraicTranslation = { ...this.customHebraicTranslation };
    } else if (lang === 'greek') {
      this.documentStorage.saveGreekCustomTranslation(this.customGreekTranslation);
      this.customGreekTranslation = { ...this.customGreekTranslation };
    } else if (lang === 'geez') {
      this.documentStorage.saveGeezCustomTranslation(this.customGeezTranslation);
      this.customGeezTranslation = { ...this.customGeezTranslation };
    }

    this.cd.detectChanges();
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

  getCorrespondingGeezVerse(verse: ScriptureVerse): Array<ScriptureVerse> {
    if (!this.selectedGeezBook) {
      return [];
    }

    const verses = new Array<ScriptureVerse>();
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

  splitIntoMatrix(text: string, lang: 'hebraic' | 'geez' | 'greek'): { index: number, word: string }[][] {
    let patterns: ParsedPatterns;
    if (lang === 'hebraic') {
      patterns = this.hebraicPatterns;
    } else if (lang === 'greek') {
      patterns = this.greekPatterns;
    } else if (lang === 'geez') {
      patterns = this.geezPatterns;
    }

    let index = 0;
    return text.split(' ').map(word => this.literalsPatternsService.splitByPatterns(patterns, word).map(word => {
      return { index: index++, word };
    }));
  }

  getGeezInterlinear(geezVerse: ScriptureVerse, geezWordIndex: number): string {
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
    scriptureVerse: ScriptureVerse,
    geezVerse: ScriptureVerse,
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

  cleanGeezTranslationInterlinear(geezVerse: ScriptureVerse, lang: 'hebraic' | 'greek'): void {
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

  getGeezColor(geezVerse: ScriptureVerse, wordIndex: number): string {
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

  getCustomTranslationFromHebraicColor(verse: ScriptureVerse, wordIndex: number): string {
    const currentBook = this.currentBook;
    if (!this.isOldBookGuard(currentBook)) {
      return '';
    }

    if (
      !this.customHebraicTranslation[currentBook] ||
      !this.customHebraicTranslation[currentBook][this.currentChapter] ||
      !this.customHebraicTranslation[currentBook][this.currentChapter][verse.verse.index]
    ) {
      return '';
    }

    const translationMetadata = this.customHebraicTranslation[currentBook][this.currentChapter][verse.verse.index].metadata;
    if (!translationMetadata) {
      return '';
    }

    const matches = translationMetadata[wordIndex] && translationMetadata[wordIndex].match(/^\d+/);
    if (matches) {
      return String(Number(Array.from(matches)[0]) % 7 + 1);
    }

    return '';
  }

  getGeezCustomTranslationColor(verse: ScriptureVerse, wordIndex: number): string {
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

  getCustomTranslationVerse(custom: AbstractHolyScriptureModel, verse: ScriptureVerse): ScriptureVerse | null {
    return custom[this.currentBook] &&
      custom[this.currentBook][this.currentChapter] &&
      custom[this.currentBook][this.currentChapter][verse.verse.index] || null;
  }

  updateCustomTranslation(input: HTMLInputElement, verse: ScriptureVerse, lang: 'hebraic' | 'geez' | 'greek'): void {
    let customTranslation: AbstractHolyScriptureModel, customBook: AbstractScriptureBook<ScriptureVerse>;
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

    if (customBook[chapter][verse.verse.index]) {
      if (input.value) {
        customBook[chapter][verse.verse.index].text = input.value;
      } else {
        customBook[chapter][verse.verse.index] = {
          ...verse,
          text: ''
        };
      }
    } else {
      customBook[chapter][verse.verse.index] = {
        ...verse,
        text: input.value
      };
    }

    if (lang === 'hebraic') {
      this.documentStorage.saveHebraicCustomTranslation(customTranslation as OldTestmentScriptures);
    } else if (lang === 'greek') {
      this.documentStorage.saveGreekCustomTranslation(customTranslation as NewTestmentScriptures);
    } else if (lang === 'geez') {
      this.documentStorage.saveGeezCustomTranslation(customTranslation as HolyScriptureModel);
    }
  }

  cleanCustomTranslation(input: HTMLInputElement, verse: ScriptureVerse, lang: 'hebraic' | 'geez' | 'greek'): void {
    if (!confirm('clean custom translation on this verse?')) {
      return;
    }
    input.value = '';
    let customTranslation: AbstractHolyScriptureModel, customBook: AbstractScriptureBook<ScriptureVerse>;
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
      text: ''
    };

    if (lang === 'hebraic') {
      this.documentStorage.saveHebraicCustomTranslation(customTranslation as OldTestmentScriptures);
    } else if (lang === 'greek') {
      this.documentStorage.saveGreekCustomTranslation(customTranslation as NewTestmentScriptures);
    } else if (lang === 'geez') {
      this.documentStorage.saveGeezCustomTranslation(customTranslation as HolyScriptureModel);
    }

    this.pipeUpdaterController++;
  }

  private createCustomTranslationStructureIfNotExists(verse: ScriptureVerse, lang: 'hebraic' | 'geez' | 'greek'): {
    metadata: string[],
    customTranslation: AbstractHolyScriptureModel<{ metadata?: string[] }>
  } {
    let customTranslation: AbstractHolyScriptureModel<{ metadata?: string[] }>, metadata: string[] = [];
    const book = this.currentBook;
    const chapter = this.currentChapter;

    if (lang === 'hebraic' && this.isOldBookGuard(book)) {
      customTranslation = this.customHebraicTranslation as AbstractHolyScriptureModel<{ metadata?: string[] }>;
    } else if (lang === 'geez') {
      customTranslation = this.customGeezTranslation as AbstractHolyScriptureModel<{ metadata?: string[] }>;
    } else if (lang === 'greek' && this.isNewBookGuard(book)) {
      customTranslation = this.customGreekTranslation as AbstractHolyScriptureModel<{ metadata?: string[] }>;
    } else {
      throw new Error('language not found');
    }

    if (!customTranslation[book]) {
      customTranslation[book] = [];
    }

    if (!customTranslation[book][chapter]) {
      customTranslation[book][chapter] = [];
    }

    if (!customTranslation[book][chapter][verse.verse.index]) {
      customTranslation[book][chapter][verse.verse.index] = {
        ...verse
      };
    }

    metadata = customTranslation[book][chapter][verse.verse.index].metadata || [];
    customTranslation[book][chapter][verse.verse.index].metadata = metadata;

    return { metadata, customTranslation };
  }

  private derivateTranslationToCustom(verse: ScriptureVerse, lang: 'hebraic' | 'geez' | 'greek'): void {
    const { customTranslation } = this.createCustomTranslationStructureIfNotExists(verse, lang);
    customTranslation[this.currentBook][this.currentChapter][verse.verse.index].text = this.splitIntoMatrix(verse.text, lang)
      .flat()
      .map(word => this.getLexical(word.word, lang))
      .join(' ');

    this.saveCustomTranslation(lang);
  }

  private derivateInterlinearToCustom(verse: ScriptureVerse, lang: 'hebraic' | 'geez' | 'greek'): void {
    const { metadata, customTranslation } = this.createCustomTranslationStructureIfNotExists(verse, lang);
    metadata.splice(0, metadata.length);
    const custom = customTranslation[this.currentBook][this.currentChapter][verse.verse.index].text.split(' ');
    this.splitIntoMatrix(verse.text, lang).flat().forEach(word => {
      if (custom[word.index] === this.getLexical(word.word, lang)) {
        metadata.push(this.castSegmentIntoMetadataIndex(word));
      }
    });

    this.saveCustomTranslation(lang);
  }

  derivateAllToCustom(verse: ScriptureVerse, lang: 'hebraic' | 'geez' | 'greek'): void {
    const current = confirm('overwrite verse translation and interlineares?');
    if (current) {
      this.derivateTranslationToCustom(verse, lang);
      setTimeout(() => this.derivateInterlinearToCustom(verse, lang));
    }
  }

  getCustomTranslationStyleRole(verse: ScriptureVerse, wordIndex: number, lang: 'hebraic' | 'geez' | 'greek'): string {
    const book = this.currentBook;
    let verseMetadata: AbstractScriptureVerse<ScriptureVerseMetadata> | null, customTranslationMetadataKey = '';

    if (lang === 'hebraic' && this.isOldBookGuard(book)) {
      const scriptureChapterMetadata = this.hebraicMetadata[book] && this.hebraicMetadata[book][this.currentChapter] || [];
      verseMetadata = scriptureChapterMetadata[verse.verse.index] || null;
      const translationChapterMetadata = this.customHebraicTranslation[book][this.currentChapter] || [];
      customTranslationMetadataKey = ((translationChapterMetadata[verse.verse.index]?.metadata || [])?.[wordIndex] || '');
    } else if (lang === 'greek' && this.isNewBookGuard(book)) {
      const scriptureChapterMetadata = this.greekMetadata[book] && this.greekMetadata[book][this.currentChapter] || [];
      verseMetadata = scriptureChapterMetadata[verse.verse.index] || null;
      const translationChapterMetadata = this.customGreekTranslation[book][this.currentChapter] || [];
      customTranslationMetadataKey = ((translationChapterMetadata[verse.verse.index]?.metadata || [])?.[wordIndex] || '');
    } else if (lang === 'geez') {
      let interlinearMetadata: { [book: string]: TranslationInterlinearVerse[][][] } = {};
      let scriptureChapterMetadata: AbstractScriptureVerse<ScriptureVerseMetadata>[] = [];

      const geezMetadata = this.customGeezTranslation[book] &&
        this.customGeezTranslation[book][this.currentChapter] &&
        this.customGeezTranslation[book][this.currentChapter][verse.verse.index]?.metadata?.[wordIndex] || '';

      if (this.isOldBookGuard(book)) {
        scriptureChapterMetadata = this.hebraicMetadata[book] && this.hebraicMetadata[book][this.currentChapter] || [];
        interlinearMetadata = this.interlinearGeezHebraic;
      } else if (this.isNewBookGuard(book)) {
        scriptureChapterMetadata = this.greekMetadata[book] && this.greekMetadata[book][this.currentChapter] || [];
        interlinearMetadata = this.interlinearGeezGreek;
      }

      const [geezWordIndex] = Array.from(geezMetadata.match(/^\d+/) || ['']);
      if (!geezWordIndex) {
        return '';
      }

      const scriptureWordOrigin = interlinearMetadata[this.currentBook][this.currentChapter][verse.verse.index][Number(geezWordIndex)]?.origin || null;
      if (!scriptureWordOrigin) {
        return '';
      }

      customTranslationMetadataKey = this.castSegmentIntoMetadataIndex(scriptureWordOrigin);
      verseMetadata = scriptureChapterMetadata && scriptureChapterMetadata[verse.verse.index];
    } else {
      throw new Error('language not found');
    }

    if (!verseMetadata || !customTranslationMetadataKey) {
      return '';
    }

    const metadata = verseMetadata.metadata || {};
    const data = metadata[customTranslationMetadataKey];
    if (!data) {
      return '';
    }

    return [data.kind, data.isWordOfGod ? 'godsaid' : ''].filter(t => t).map(d => `meta${d}`).join(' ');
  }

  getCustomTranslationInterlinearValue(
    customTranslation: AbstractHolyScriptureModel<{ metadata?: string[] }>, verse: ScriptureVerse, wordIndex: number
  ): string {
    const chapter = customTranslation[this.currentBook][this.currentChapter];
    if (chapter && chapter[verse.verse.index] && chapter[verse.verse.index].metadata) {
      const metadata = chapter[verse.verse.index].metadata;
      return metadata && metadata[wordIndex] || '';
    }

    return '';
  }

  saveCustomTranslationInterlinearMetadata(value: string, verse: ScriptureVerse, wordIndex: number, lang: 'hebraic' | 'geez' | 'greek'): void {
    const { metadata } = this.createCustomTranslationStructureIfNotExists(verse, lang);
    metadata[wordIndex] = value;

    this.saveCustomTranslation(lang);
  }

  cleanGeezScripturesInterlinear(verse: ScriptureVerse, lang: 'hebraic' | 'geez' | 'greek'): void {
    let customTranslation: AbstractHolyScriptureModel<{ metadata?: string[] }>, metadata: string[] = [];
    const book = this.currentBook;
    const chapter = this.currentChapter;

    if (lang === 'hebraic' && this.isOldBookGuard(book)) {
      customTranslation = this.customHebraicTranslation as AbstractHolyScriptureModel<{ metadata?: string[] }>;
    } else if (lang === 'geez') {
      customTranslation = this.customGeezTranslation as AbstractHolyScriptureModel<{ metadata?: string[] }>;
    } else if (lang === 'greek' && this.isNewBookGuard(book)) {
      customTranslation = this.customGreekTranslation as AbstractHolyScriptureModel<{ metadata?: string[] }>;
    } else {
      throw new Error('language not found');
    }

    if (
      !customTranslation[book] ||
      !customTranslation[book][chapter] ||
      !customTranslation[book][chapter][verse.verse.index]
    ) {
      return;
    }

    delete customTranslation[book][chapter][verse.verse.index].metadata;
    this.pipeUpdaterController++;
  }

  splitTextBySpacesAndPunctuation(value: string): string[] {
    return [...value.matchAll(/(\s*)(\S+?)(\.{3}|…|[.!?]+)?(?=\s|$)/g)]
      .flatMap(m => m[3] ? [`${m[1]}${m[2]}`, m[3]] : [`${m[1]}${m[2]}`])
      .map(m => m.trim());
  }

  updateLexical(input: HTMLInputElement, word: string, lang: 'hebraic' | 'geez' | 'greek'): void {
    if (lang === 'hebraic') {
      this.documentStorage.addHebraicLexical(word, input.value);
    } else if (lang === 'greek') {
      this.documentStorage.addGreekLexical(word, input.value);
    } else if (lang === 'geez') {
      this.documentStorage.addGeezLexical(word, input.value);
    }

    input.style.width = `${this.calcFieldSize(word, input.value)}px`;
    this.pipeUpdaterController++;
  }

  getLexical(word: string, lang: 'hebraic' | 'geez' | 'greek'): string {
    if (lang === 'hebraic') {
      return this.documentStorage.getHebraicLexical()[word];
    } else if (lang === 'geez') {
      return this.documentStorage.getGeezLexical()[word];
    } else if (lang === 'greek') {
      return this.documentStorage.getGreekLexical()[word];
    }

    return '';
  }

  cleanLexicalInterlinear(eachWord: Array<Array<{ index: number; word: string; }>>, lang: 'hebraic' | 'geez' | 'greek'): void {
    if (!confirm('remove lexical interlinear from verse and from all it occurrences?')) {
      return;
    }

    eachWord.forEach(eachSegment => {
      eachSegment.forEach(segment => {
        if (lang === 'hebraic') {
          this.documentStorage.removeHebraicLexical(segment.word);
        } else if (lang === 'greek') {
          this.documentStorage.removeGreekLexical(segment.word);
        } else if (lang === 'geez') {
          this.documentStorage.removeGeezLexical(segment.word);
        }
      });
    });

    this.pipeUpdaterController++;
  }

  createIfNotExistsWordMetadata(
    verseIndex: number,
    verse: ScriptureVerse,
    lang: 'hebraic' | 'geez' | 'greek',
    segments: Array<{ index: number; word: string; }> = []
  ): {
    [key: string]: ScriptureVerseMetadataWord;
  } {
    let codiceMetadata: AbstractCodice<string, AbstractScriptureVerse<ScriptureVerseMetadata>> = {};
    if (lang === 'hebraic' && this.isOldBookGuard(this.currentBook)) {
      codiceMetadata = this.hebraicMetadata;
    } else if (lang === 'greek' && this.isNewBookGuard(this.currentBook)) {
      codiceMetadata = this.greekMetadata;
    }

    if (!codiceMetadata[this.currentBook]) {
      codiceMetadata[this.currentBook] = [];
    }

    if (!codiceMetadata[this.currentBook][this.currentChapter]) {
      codiceMetadata[this.currentBook][this.currentChapter] = [];
    }

    if (!codiceMetadata[this.currentBook][this.currentChapter][verseIndex]) {
      codiceMetadata[this.currentBook][this.currentChapter][verseIndex] = {
        verse: verse.verse,
        metadata: {}
      };
    }

    const metadata = codiceMetadata[this.currentBook][this.currentChapter][verseIndex].metadata || {};
    codiceMetadata[this.currentBook][this.currentChapter][verseIndex].metadata = metadata;

    segments.forEach(segment => {
      const key = this.castSegmentIntoMetadataIndex(segment);
      if (!metadata[key]) {
        metadata[key] = {
          kind: '',
          segment: segment.word
        };
      }
    });

    return metadata;
  }

  setAsWordOfGod(
    input: HTMLInputElement,
    verseIndex: number,
    verse: ScriptureVerse,
    segments: Array<{ index: number; word: string; }>,
    lang: 'hebraic' | 'geez' | 'greek'
  ): void {
    const wordMetadata = this.createIfNotExistsWordMetadata(verseIndex, verse, lang, segments);
    segments.forEach(segment => {
      const key = this.castSegmentIntoMetadataIndex(segment);
      if (input.checked) {
        wordMetadata[key].isWordOfGod = true;
      } else {
        delete wordMetadata[key].isWordOfGod;
      }
    });

    if (lang === 'hebraic' && this.isOldBookGuard(this.currentBook)) {
      this.documentStorage.saveHebraicMetadata(this.hebraicMetadata);
    } else if (lang === 'greek' && this.isNewBookGuard(this.currentBook)) {
      this.documentStorage.saveGreekMetadata(this.greekMetadata);
    }
  }

  getScriptureMetadataDefinedKind(
    verseKey: number,
    segment: { index: number; word: string; },
    lang: 'hebraic' | 'geez' | 'greek'
  ): '' | 'godname' | 'keyword' | 'character' | 'amount' {
    let codiceMetadata: AbstractCodice<string, AbstractScriptureVerse<ScriptureVerseMetadata>> = {};
    if (lang === 'hebraic' && this.isOldBookGuard(this.currentBook)) {
      codiceMetadata = this.hebraicMetadata;
    } else if (lang === 'greek' && this.isNewBookGuard(this.currentBook)) {
      codiceMetadata = this.greekMetadata;
    }

    if (
      !codiceMetadata[this.currentBook] ||
      !codiceMetadata[this.currentBook][this.currentChapter] ||
      !codiceMetadata[this.currentBook][this.currentChapter][verseKey]
    ) {
      return '';
    }

    const metadata = codiceMetadata[this.currentBook][this.currentChapter][verseKey].metadata;
    if (!metadata) {
      return '';
    }

    const metadataKey = this.castSegmentIntoMetadataIndex(segment)
    if (!metadata[metadataKey]) {
      return '';
    }

    return metadata[metadataKey].kind;
  }

  getScriptureMetadataWordOfGod(
    verseKey: number,
    segments: Array<{ index: number; word: string; }>,
    lang: 'hebraic' | 'geez' | 'greek'
  ): boolean {
    let codiceMetadata: AbstractCodice<string, AbstractScriptureVerse<ScriptureVerseMetadata>> = {};
    if (lang === 'hebraic' && this.isOldBookGuard(this.currentBook)) {
      codiceMetadata = this.hebraicMetadata;
    } else if (lang === 'greek' && this.isNewBookGuard(this.currentBook)) {
      codiceMetadata = this.greekMetadata;
    }

    if (
      !codiceMetadata[this.currentBook] ||
      !codiceMetadata[this.currentBook][this.currentChapter] ||
      !codiceMetadata[this.currentBook][this.currentChapter][verseKey]
    ) {
      return false;
    }

    const metadata = codiceMetadata[this.currentBook][this.currentChapter][verseKey].metadata;

    if (!metadata || !segments[0]) {
      return false;
    }

    const segment = this.castSegmentIntoMetadataIndex(segments[0]);
    const data = metadata[segment];
    if (!data) {
      return false;
    }

    return data.isWordOfGod || false;
  }

  cleanWordOfGodFromVerse(verse: ScriptureVerse, lang: 'hebraic' | 'greek'): void {
    if (!confirm('Confirm clean words set as "word of God"?')) {
      return;
    }

    let codiceMetadata: AbstractCodice<string, AbstractScriptureVerse<ScriptureVerseMetadata>> = {};
    if (lang === 'hebraic' && this.isOldBookGuard(this.currentBook)) {
      codiceMetadata = this.hebraicMetadata;
    } else if (lang === 'greek' && this.isNewBookGuard(this.currentBook)) {
      codiceMetadata = this.greekMetadata;
    }

    if (
      !codiceMetadata[this.currentBook] ||
      !codiceMetadata[this.currentBook][this.currentChapter] ||
      !codiceMetadata[this.currentBook][this.currentChapter][verse.verse.index]
    ) {
      return;
    }

    const metadata = codiceMetadata[this.currentBook][this.currentChapter][verse.verse.index].metadata;
    if (!metadata) {
      return;
    }

    Object.keys(metadata).forEach(key => {
      delete metadata[key].isWordOfGod;
    });

    if (lang === 'hebraic' && this.isOldBookGuard(this.currentBook)) {
      this.documentStorage.saveHebraicMetadata(this.hebraicMetadata);
    } else if (lang === 'greek' && this.isNewBookGuard(this.currentBook)) {
      this.documentStorage.saveGreekMetadata(this.greekMetadata);
    }
  }

  updateScripturesMetadata(
    input: HTMLSelectElement,
    verseIndex: number,
    verse: ScriptureVerse,
    segment: { index: number; word: string; },
    lang: 'hebraic' | 'geez' | 'greek'
  ): void {
    const wordMetadata = this.createIfNotExistsWordMetadata(verseIndex, verse, lang, [segment]);
    const kind = input.value;
    const metadatIndex = this.castSegmentIntoMetadataIndex(segment);

    if (this.isWordSegmentMetadataGuard(kind)) {
      wordMetadata[metadatIndex].kind = kind;
    } else {
      if (wordMetadata[metadatIndex].isWordOfGod) {
        wordMetadata[metadatIndex].kind = '';
      } else {
        delete wordMetadata[metadatIndex];
      }
    }

    if (lang === 'hebraic' && this.isOldBookGuard(this.currentBook)) {
      this.documentStorage.saveHebraicMetadata(this.hebraicMetadata);
    } else if (lang === 'greek' && this.isNewBookGuard(this.currentBook)) {
      this.documentStorage.saveGreekMetadata(this.greekMetadata);
    }
  }

  cleanScriptureMetadata(verse: ScriptureVerse, lang: 'hebraic' | 'geez' | 'greek'): void {
    if (!confirm('remove metadata?')) {
      return;
    }

    let codiceMetadata: AbstractCodice<string, AbstractScriptureVerse<ScriptureVerseMetadata>> = {};
    if (lang === 'hebraic' && this.isOldBookGuard(this.currentBook)) {
      codiceMetadata = this.hebraicMetadata;
    } else if (lang === 'greek' && this.isNewBookGuard(this.currentBook)) {
      codiceMetadata = this.greekMetadata;
    }

    if (
      !codiceMetadata[this.currentBook] ||
      !codiceMetadata[this.currentBook][this.currentChapter] ||
      !codiceMetadata[this.currentBook][this.currentChapter][verse.verse.index]
    ) {
      return;
    }

    const chapter = codiceMetadata[this.currentBook][this.currentChapter][verse.verse.index];
    const metadata = chapter?.metadata;

    if (!metadata) {
      return;
    }
    
    Object.keys(metadata).forEach(key => {
      metadata[key].kind = '';
    });

    if (lang === 'hebraic' && this.isOldBookGuard(this.currentBook)) {
      this.documentStorage.saveHebraicMetadata(this.hebraicMetadata);
    } else if (lang === 'greek' && this.isNewBookGuard(this.currentBook)) {
      this.documentStorage.saveGreekMetadata(this.greekMetadata);
    }
  }

  isWordSegmentMetadataGuard(value: string): value is 'godname' | 'keyword' | 'character' | 'amount' {
    return ['godname', 'keyword', 'character', 'amount'].includes(value);
  }

  isOldBookGuard(book: OldTestamentBooksUnion | NewTestamentBooksUnion): book is OldTestamentBooksUnion {
    return (oldTestamentBookList as string[]).includes(book);
  }

  isNewBookGuard(book: OldTestamentBooksUnion | NewTestamentBooksUnion): book is NewTestamentBooksUnion {
    return (newTestamentBookList as string[]).includes(book);
  }

  castSegmentIntoMetadataIndex(segment: { index: number; word: string; }): string {
    const word = demassoretifier(segment.word);
    return `${segment.index}-${word}`;
  }
}
