import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AddPatternContextMenu } from './add-pattern-context-menu/add-pattern-context-menu';
import { AddPatternContextMenuTrigger } from './add-pattern-context-menu/add-pattern-context-menu-trigger';
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
import { LabelfyMetadataDelimitation } from './labelfy-metadata-delimitation/labelfy-metadata-delimitation';
import { LiteralizatePipe } from './literalizate-pipe';
import { LiteralsPatternsService } from './literals-patterns-service';
import { LiteralsPipe } from './literals-pipe';
import { LiteralsStorage } from './literals-storage';
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
    PaleoPipe,
    VersePipe,
    GematricsPipe,
    LiteralsPipe,
    LiteralizatePipe,
    TransliterationPipe,
    ReactiveFormsModule,
    AddPatternContextMenu,
    AddPatternContextMenuTrigger,
    LabelfyMetadataDelimitation
  ],
  providers: [
    LiteralsStorage
  ],
  templateUrl: './inspector.html',
  styleUrl: './inspector.scss'
})
export class Inspector implements OnInit {

  readonly hebraics = hebraics;
  readonly geezes = geezes;

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

  translation: Translation | null = null;
  customHebraicTranslation!: OldTestmentScriptures;
  customGreekTranslation!: NewTestmentScriptures;
  customGeezTranslation!: HolyScriptureModel;
  chapterTranslations: Array<TranslationBookVerse> = [];

  book: OldBook | NewBook = OldBook.GN;
  chapter = 0;
  form: any;

  pipeUpdaterController = 1;

  constructor(
    fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private literalsStorage: LiteralsStorage,
    private translationService: TranslationService,
    private literalsPatternsService: LiteralsPatternsService
  ) {
    this.form = fb.group({
      lang: ['hebraic', [Validators.required]],
      word: ['', [Validators.required]],
      type: ['prefix', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.readCustomTranslation();
    this.readPatterns();
    this.readInterlineares();
    this.subscribeParams();
    this.subscribeTranslation();
  }

  private readPatterns(): void {
    this.hebraicPatterns = this.literalsStorage.getHebraicPattern();
    this.geezPatterns = this.literalsStorage.getGeezPattern();
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
        this.book = params['book'];
        this.chapter = Number(params['chapter']) - 1;
        this.updateChapterTranslation();
      }
    });
  }

  private subscribeTranslation(): void {
    this.activatedRoute.data.subscribe({
      next: params => {
        this.translation = params['translation'];
        this.updateChapterTranslation();
      }
    });
  }

  private updateChapterTranslation(): void {
    this.chapterTranslations = this.translationService.getChapter(this.translation, this.book, this.chapter);
    this.cd.detectChanges();
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

  onAddPattern(option: {
    word: string;
    type: "prefix" | "suffix";
    lang: "hebraic" | "geez" | "greek";
  }): void {
    if (option.lang === 'hebraic') {
      this.hebraicPatterns = this.literalsStorage.addHebraicPattern(option.word, option.type);
    } else if (option.lang === 'geez') {
      this.geezPatterns = this.literalsStorage.addGeezPattern(option.word, option.type);
    }
  }

  //  FIXME: remover
  onDelimitationDefined(option: {
    lang: 'hebraic' | 'geez' | 'greek',
    type: 'godsaid' | 'keyword' | 'quantitative',
    book: OldBook | NewBook,
    chapter: number,
    verse: ScriptureVerse,
    start: number,
    end: number
  }): void {
    let custom: AbstractHolyScriptureModel;
    if (option.lang === 'hebraic') {
      custom = this.customHebraicTranslation;
    } else if (option.lang === 'geez') {
      custom = this.customGeezTranslation;
    } else if (option.lang === 'greek') {
      custom = this.customGreekTranslation;
    } else {
      throw new Error(`language '${option.lang}' not found`);
    }

    this.saveCustomTranslation();
  }

  saveCustomTranslation(): void {
    this.literalsStorage.saveHebraicCustomTranslation(this.customHebraicTranslation);
    this.literalsStorage.saveGeezCustomTranslation(this.customGreekTranslation);
    this.literalsStorage.saveGreekCustomTranslation(this.customGeezTranslation);

    this.customHebraicTranslation = { ...this.customHebraicTranslation };
    this.customGreekTranslation = { ...this.customGreekTranslation };
    this.customGeezTranslation = { ...this.customGeezTranslation };

    this.cd.detectChanges();
  }

  getCustomTranslationVerse(custom: AbstractHolyScriptureModel, verse: ScriptureVerse): ScriptureVerse | null {
    return custom[this.book] && custom[this.book][this.chapter] && custom[this.book][this.chapter][verse.verse.index];
  }

  //  FIXME: está lógica poderá ser removida quando o JSON de geez, hebraico e grego forem fundidos em um único JSON
  getCorrespondingGeezVerse(hebraicVerse: ScriptureVerse): Array<ScriptureVerse> {
    const verses = new Array<ScriptureVerse>();
    for (let index = 0; index < this.geezes[this.book][this.chapter].length; index++) {
      const geezVerse = this.geezes[this.book][this.chapter][index];

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
    if (!this.isOldBookGuard(this.book)) {
      return '';
    }

    try {
      const interlinear = this.interlinearGeezHebraic[this.book][this.chapter][Number(geezVerse)][geezWordIndex];
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

    if (!this.isOldBookGuard(this.book)) {
      return;
    }

    if (!this.interlinearGeezHebraic[this.book][this.chapter]) {
      this.interlinearGeezHebraic[this.book][this.chapter] = [];
    }

    if (!this.interlinearGeezHebraic[this.book][this.chapter][geezVerseNumber]) {
      this.interlinearGeezHebraic[this.book][this.chapter][geezVerseNumber] = [];
    }

    this.interlinearGeezHebraic[this.book][this.chapter][geezVerseNumber][geezIndex] = {
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
    if (!this.isOldBookGuard(this.book)) {
      return '';
    }

    //  FIXME: revisar comportamento para versiculos compostos
    const verseNumber = Number(geezVerse.verse.start);
    if (
      !this.interlinearGeezHebraic[this.book] ||
      !this.interlinearGeezHebraic[this.book][this.chapter] ||
      !this.interlinearGeezHebraic[this.book][this.chapter][verseNumber] ||
      !this.interlinearGeezHebraic[this.book][this.chapter][verseNumber][wordIndex]
    ) {
      return '';
    }

    const map = this.interlinearGeezHebraic[this.book][this.chapter][verseNumber][wordIndex];
    return String(map.origin.index % 7 + 1);
  }

  getCustomTranslationFromHebraicColor(verse: ScriptureVerse, wordIndex: number): string {
    const verseNumber = Number(verse.verse.start);
    if (
      !this.interlinearGeezCustomTranslation[this.book] ||
      !this.interlinearGeezCustomTranslation[this.book][this.chapter] ||
      !this.interlinearGeezCustomTranslation[this.book][this.chapter][verseNumber] ||
      !this.interlinearGeezCustomTranslation[this.book][this.chapter][verseNumber][wordIndex]
    ) {
      return '';
    }

    const map = this.interlinearGeezCustomTranslation[this.book][this.chapter][verseNumber][wordIndex];
    return String(map.origin.index % 7 + 1);
  }

  getCustomTranslationFromGeezColor(verse: ScriptureVerse, wordIndex: number): string {
    if (!this.isOldBookGuard(this.book)) {
      return '';
    }

    const verseNumber = Number(verse.verse.start);
    if (
      !this.interlinearHebraicCustomTranslation[this.book] ||
      !this.interlinearHebraicCustomTranslation[this.book][this.chapter] ||
      !this.interlinearHebraicCustomTranslation[this.book][this.chapter][verseNumber] ||
      !this.interlinearHebraicCustomTranslation[this.book][this.chapter][verseNumber][wordIndex]
    ) {
      return '';
    }

    const map = this.interlinearHebraicCustomTranslation[this.book][this.chapter][verseNumber][wordIndex];
    return String(map.origin.index % 7 + 1);
  }

  getCustomTranslationFromGreekColor(verse: ScriptureVerse, wordIndex: number): string {
    if (!this.isNewBookGuard(this.book)) {
      return '';
    }

    const verseNumber = Number(verse.verse.start);
    if (
      !this.interlinearGreekCustomTranslation[this.book] ||
      !this.interlinearGreekCustomTranslation[this.book][this.chapter] ||
      !this.interlinearGreekCustomTranslation[this.book][this.chapter][verseNumber] ||
      !this.interlinearGreekCustomTranslation[this.book][this.chapter][verseNumber][wordIndex]
    ) {
      return '';
    }

    const map = this.interlinearGreekCustomTranslation[this.book][this.chapter][verseNumber][wordIndex];
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
      this.literalsStorage.addHebraicLiteral(word, input.value);
    } else if (lang === 'geez') {
      this.literalsStorage.addGeezLiteral(word, input.value);
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
    const book = this.book;
    const chapter = this.chapter;

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
      this.literalsStorage.saveHebraicCustomTranslation(customTranslation);
    } else if (lang === 'geez') {
      this.literalsStorage.saveGeezCustomTranslation(customTranslation);
    } else if (lang === 'greek') {
      this.literalsStorage.saveGreekCustomTranslation(customTranslation);
    }
  }

  onPatternFormSubmit(): void {
    if (this.form.valid) {
      const { type, value } = this.form.value;
      this.hebraicPatterns = this.literalsStorage.addHebraicPattern(value, type);

      this.form.reset();
    } else {
      this.form.markAllAsTouched();
    }
  }

  deletePattern(lang: 'hebraic' | 'geez' | 'greek', type: 'prefix' | 'suffix', index: number, key: string): void {
    if (lang === 'hebraic') {
      this.literalsStorage.deleteHebraicPattern(type, index);
      this.hebraicPatterns[type].delete(key);
    } else if (lang === 'geez') {
      this.literalsStorage.deleteGeezPattern(type, index);
      this.geezPatterns[type].delete(key);
    }
  }
}
