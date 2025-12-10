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
import { Translation } from './domain/translation-model';
import { GematricsPipe } from './gematrics-pipe';
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
  geezMetadata!: AbstractCodice<OldTestamentBooksUnion | NewTestamentBooksUnion, AbstractScriptureVerse<ScriptureVerseMetadata>>;

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
    this.geezMetadata = this.documentStorage.getGeezMetadata();
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

  removeTranslationByIndex(index: number): void {
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
      this.hebraicPatterns = this.documentStorage.addHebraicPattern(option.word, option.type);
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
        this.selectedBook,
        'chapter',
        (+this.selectedChapter) + 1
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

  getCorrespondingGeezVerse(hebraicVerse: ScriptureVerse): Array<ScriptureVerse> {
    if (!this.selectedGeezBook) {
      return [];
    }

    const verses = new Array<ScriptureVerse>();
    for (let index = 0; index < this.selectedGeezBook[this.currentChapter].length; index++) {
      const geezVerse = this.selectedGeezBook[this.currentChapter][index];

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

  getCustomTranslationVerse(custom: AbstractHolyScriptureModel, verse: ScriptureVerse): ScriptureVerse | null {
    return custom[this.currentBook] && custom[this.currentBook][this.currentChapter] && custom[this.currentBook][this.currentChapter][verse.verse.index];
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

    customBook[chapter][verse.verse.index] = {
      ...verse,
      text: input.value
    };

    if (lang === 'hebraic') {
      this.documentStorage.saveHebraicCustomTranslation(customTranslation as OldTestmentScriptures);
    } else if (lang === 'greek') {
      this.documentStorage.saveGreekCustomTranslation(customTranslation as NewTestmentScriptures);
    } else if (lang === 'geez') {
      this.documentStorage.saveGeezCustomTranslation(customTranslation as HolyScriptureModel);
    }
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

  derivateTranslationToCustom(verse: ScriptureVerse, lang: 'hebraic' | 'geez' | 'greek'): void {
    const { customTranslation } = this.createCustomTranslationStructureIfNotExists(verse, lang);
    customTranslation[this.currentBook][this.currentChapter][verse.verse.index].text = this.splitIntoMatrix(verse.text, lang).flat().map(word => this.getLexical(word.word, lang)).join(' ');
    this.saveCustomTranslation(lang);
  }

  derivateInterlinearToCustom(verse: ScriptureVerse, lang: 'hebraic' | 'geez' | 'greek'): void {
    const { metadata, customTranslation } = this.createCustomTranslationStructureIfNotExists(verse, lang);
    metadata.splice(0, metadata.length);
    const custom = customTranslation[this.currentBook][this.currentChapter][verse.verse.index].text.split(' ');
    this.splitIntoMatrix(verse.text, lang).flat().forEach(word => {
      if (custom[word.index] === this.getLexical(word.word, lang)) {
        metadata.push(`${word.index}-${word.word}`);
      }
    });
    this.saveCustomTranslation(lang);
  }

  derivateAllToCustom(verse: ScriptureVerse, lang: 'hebraic' | 'geez' | 'greek'): void {
    this.derivateTranslationToCustom(verse, lang);
    this.derivateInterlinearToCustom(verse, lang);
  }

  getCustomTranslationStyleRole(verse: ScriptureVerse, wordIndex: number, lang: 'hebraic' | 'geez' | 'greek'): string {
    const book = this.currentBook;
    let verseMetadata: AbstractScriptureVerse<ScriptureVerseMetadata> | null, customTranslationMetadata: [string, string];

    if (lang === 'hebraic' && this.isOldBookGuard(book)) {
      const scriptureChapterMetadata = this.hebraicMetadata[book] && this.hebraicMetadata[book][this.currentChapter] || [];
      verseMetadata = scriptureChapterMetadata[verse.verse.index] || null;
      const translationChapterMetadata = this.customHebraicTranslation[book][this.currentChapter] || [];
      customTranslationMetadata = ((translationChapterMetadata[verse.verse.index]?.metadata || [])?.[wordIndex] || '').split('-') as [string, string];
    } else if (lang === 'greek' && this.isNewBookGuard(book)) {
      const scriptureChapterMetadata = this.greekMetadata[book] && this.greekMetadata[book][this.currentChapter] || [];
      verseMetadata = scriptureChapterMetadata[verse.verse.index] || null;
      const translationChapterMetadata = this.customGreekTranslation[book][this.currentChapter] || [];
      customTranslationMetadata = ((translationChapterMetadata[verse.verse.index]?.metadata || [])?.[wordIndex] || '').split('-') as [string, string];
    } else if (lang === 'geez') {
      const scriptureChapterMetadata = this.geezMetadata[book] && this.geezMetadata[book][this.currentChapter] || [];
      verseMetadata = scriptureChapterMetadata[verse.verse.index] || null;
      const translationChapterMetadata = this.customGeezTranslation[book][this.currentChapter] || [];
      customTranslationMetadata = ((translationChapterMetadata[verse.verse.index]?.metadata || [])?.[wordIndex] || '').split('-') as [string, string];
    } else {
      throw new Error('language not found');
    }

    if (!verseMetadata || customTranslationMetadata.length !== 2) {
      return '';
    }

    const metadata = verseMetadata.metadata || [];
    if (!metadata.length) {
      return '';
    }

    const list = metadata.map(data => {
      if (data) {
        return data.segments.map(segment => {
          return { segment, isWordOfGod: data.isWordOfGod }
        })
      }

      return null;
    }).flat();

    const [ index, segment ] = customTranslationMetadata;
    const data = list[+index];

    if (!data) {
      return '';
    } else if (data.segment?.segment !== segment) {
      console.warn('Metadata not found, translation metadata: ', customTranslationMetadata);
      return '';
    }

    return [data.segment.kind, data.isWordOfGod ? 'goidsaid' : ''].filter(t => t).map(d => `meta${d}`).join(' ');
  }

  saveCustomTranslationInterlinearMetadata(value: string, verse: ScriptureVerse, index: number, lang: 'hebraic' | 'geez' | 'greek'): void {
    const { metadata } = this.createCustomTranslationStructureIfNotExists(verse, lang);
    metadata[index] = value;

    this.saveCustomTranslation(lang);
  }

  splitTextBySpacesAndPunctuation(value: string): string[] {
    return [...value.matchAll(/(\s*)(\S+?)(\.{3}|…|[.!?]+)?(?=\s|$)/g)]
      .flatMap(m => m[3] ? [`${m[1]}${m[2]}`, m[3]] : [`${m[1]}${m[2]}`]);
  }

  updateLexical(input: HTMLInputElement, word: string, lang: 'hebraic' | 'geez' | 'greek'): void {
    if (lang === 'hebraic') {
      this.documentStorage.addHebraicLexical(word, input.value);
    } else if (lang === 'geez') {
      this.documentStorage.addGeezLexical(word, input.value);
    } else if (lang === 'greek') {
      this.documentStorage.addGreekLexical(word, input.value);
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

  createIfNotExistsWordMetadata(
    wordIndex: number, word: string, verseIndex: number, verse: ScriptureVerse, lang: 'hebraic' | 'geez' | 'greek'
  ): ScriptureVerseMetadataWord {
    let codiceMetadata: AbstractCodice<string, AbstractScriptureVerse<ScriptureVerseMetadata>> = {};
    if (lang === 'hebraic' && this.isOldBookGuard(this.currentBook)) {
      codiceMetadata = this.hebraicMetadata;
    } else if (lang === 'greek' && this.isNewBookGuard(this.currentBook)) {
      codiceMetadata = this.greekMetadata;
    } else if (lang === 'geez') {
      codiceMetadata = this.geezMetadata;
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
        metadata: []
      };
    }

    const metadata = codiceMetadata[this.currentBook][this.currentChapter][verseIndex].metadata || [];
    codiceMetadata[this.currentBook][this.currentChapter][verseIndex].metadata = metadata;
    let wordMetadata: ScriptureVerseMetadataWord = metadata[wordIndex] || {
      word,
      segments: []
    };

    metadata[wordIndex] = wordMetadata;

    return wordMetadata;
  }

  setAsWordOfGod(
    input: HTMLInputElement,
    verseIndex: number,
    wordIndex: number,
    word: string,
    verse: ScriptureVerse,
    lang: 'hebraic' | 'geez' | 'greek'
  ): void {
    const wordMetadata = this.createIfNotExistsWordMetadata(wordIndex, word, verseIndex, verse, lang);
    if (input.checked) {
      wordMetadata.isWordOfGod = true;
    } else {
      delete wordMetadata.isWordOfGod;
    }

    if (lang === 'hebraic' && this.isOldBookGuard(this.currentBook)) {
      this.documentStorage.saveHebraicMetadata(this.hebraicMetadata);
    } else if (lang === 'greek' && this.isNewBookGuard(this.currentBook)) {
      this.documentStorage.saveGreekMetadata(this.greekMetadata);
    } else if (lang === 'geez') {
      this.documentStorage.saveGeezMetadata(this.geezMetadata);
    }
  }

  getScriptureMetadataDefinedKind(
    verseKey: number,
    wordIndex: number,
    segmentIndex: number,
    lang: 'hebraic' | 'geez' | 'greek'
  ): '' | 'godname' | 'keyword' | 'character' | 'amount' {
    let codiceMetadata: AbstractCodice<string, AbstractScriptureVerse<ScriptureVerseMetadata>> = {};
    if (lang === 'hebraic' && this.isOldBookGuard(this.currentBook)) {
      codiceMetadata = this.hebraicMetadata;
    } else if (lang === 'greek' && this.isNewBookGuard(this.currentBook)) {
      codiceMetadata = this.greekMetadata;
    } else if (lang === 'geez') {
      codiceMetadata = this.geezMetadata;
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

    if (!metadata[wordIndex] || !metadata[wordIndex].segments[segmentIndex]) {
      return '';
    }

    return metadata[wordIndex].segments[segmentIndex].kind;
  }

  getScriptureMetadataWordOfGod(
    verseKey: number,
    wordIndex: number,
    lang: 'hebraic' | 'geez' | 'greek'
  ): boolean {
    let codiceMetadata: AbstractCodice<string, AbstractScriptureVerse<ScriptureVerseMetadata>> = {};
    if (lang === 'hebraic' && this.isOldBookGuard(this.currentBook)) {
      codiceMetadata = this.hebraicMetadata;
    } else if (lang === 'greek' && this.isNewBookGuard(this.currentBook)) {
      codiceMetadata = this.greekMetadata;
    } else if (lang === 'geez') {
      codiceMetadata = this.geezMetadata;
    }

    if (
      !codiceMetadata[this.currentBook] ||
      !codiceMetadata[this.currentBook][this.currentChapter] ||
      !codiceMetadata[this.currentBook][this.currentChapter][verseKey]
    ) {
      return false;
    }

    const metadata = codiceMetadata[this.currentBook][this.currentChapter][verseKey].metadata;
    if (!metadata || !metadata[wordIndex]) {
      return false;
    }

    return metadata[wordIndex].isWordOfGod || false;
  }

  updateScripturesMetadata(
    input: HTMLSelectElement,
    verseIndex: number,
    verse: ScriptureVerse,
    wordIndex: number,
    segmentIndex: number,
    word: string,
    segment: { index: number; word: string; },
    lang: 'hebraic' | 'geez' | 'greek'
  ): void {
    const wordMetadata = this.createIfNotExistsWordMetadata(wordIndex, word, verseIndex, verse, lang);
    const kind = input.value;

    if (this.isWordSegmentMetadataGuard(kind)) {
      wordMetadata.segments[segmentIndex] = {
        kind,
        segment: segment.word
      }
    } else {
      wordMetadata.segments[segmentIndex] = null;
    }

    if (lang === 'hebraic' && this.isOldBookGuard(this.currentBook)) {
      this.documentStorage.saveHebraicMetadata(this.hebraicMetadata);
    } else if (lang === 'greek' && this.isNewBookGuard(this.currentBook)) {
      this.documentStorage.saveGreekMetadata(this.greekMetadata);
    } else if (lang === 'geez') {
      this.documentStorage.saveGeezMetadata(this.geezMetadata);
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
}
