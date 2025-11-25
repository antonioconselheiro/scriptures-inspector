import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AddPatternContextMenu } from './add-pattern-context-menu/add-pattern-context-menu';
import { AddPatternContextMenuTrigger } from './add-pattern-context-menu/add-pattern-context-menu-trigger';
import { AbstractHolyScriptureModel } from './domain/abstract-holy-scripture-model';
import { HolyScriptureModel } from './domain/holy-scripture-model';
import { InterlinearGeezGreek } from './domain/interlinear-geez-greek-model';
import { InterlinearGeezHebraic } from './domain/interlinear-geez-hebraic-model';
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
import { LiteralsPipe } from './literals-pipe';
import { LiteralsStorage } from './literals-storage';
import { PaleoPipe } from './paleo-pipe';
import { ParsedPatterns } from './parsed-patterns';
import { TranslationMetadataContextMenu } from './translation-metadata-context-menu/translation-metadata-context-menu';
import { TranslationMetadataContextMenuTrigger } from './translation-metadata-context-menu/translation-metadata-context-menu-trigger';
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
    TranslationMetadataContextMenu,
    TranslationMetadataContextMenuTrigger
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

  translation: Translation | null = null;
  customHebraicTranslation!: OldTestmentScriptures;
  customGreekTranslation!: NewTestmentScriptures;
  customGeezTranslation!: HolyScriptureModel;
  chapterTranslations: Array<TranslationBookVerse> = [];

  book: OldBook = OldBook.GN;
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

  onDelimitationDefined(option: {
    lang: 'hebraic' | 'geez' | 'greek',
    type: 'godsaid' | 'keyword' | 'measure',
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

    const metadata = custom[option.book][option.chapter][option.verse.verse.index].metadata = custom[option.book][option.chapter][option.verse.verse.index].metadata || new Array<{
      type: 'godsaid' | 'keyword' | 'measure',
      start: number,
      end: number
    }>();

    metadata.push({
      type: option.type,
      start: option.start,
      end: option.end
    });
  }

  getCustomTranslationVerse(custom: AbstractHolyScriptureModel, book: OldBook, chapter: number, verse: ScriptureVerse): string {
    return custom[book] && custom[book][chapter] && custom[book][chapter][verse.verse.index]?.text || '';
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

  updateCustomTranslation(input: HTMLInputElement, book: OldBook | NewBook, chapter: number, verse: ScriptureVerse, lang: 'hebraic' | 'geez' | 'greek'): void {
    let customTranslation: AbstractHolyScriptureModel, customBook: ScriptureBook;

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
