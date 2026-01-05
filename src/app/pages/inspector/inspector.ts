import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AsyncModalModule } from '@belomonte/async-modal-ngx';
import { CodexBookChapterVerseMetadata } from '../../domain/codex-book-chapter-verse-metadata-model';
import { CodexBookVerse } from '../../domain/codex-book-verse-model';
import { Codex } from '../../domain/codex-model';
import { ParsedPatterns } from '../../domain/parsed-patterns';
import { SourceVerse } from '../../domain/source-verse-model';
import { TranslationInterlinearVerse } from '../../domain/translation-interlinear-verse-model';
import { AddPatternContextMenu } from './add-pattern-context-menu/add-pattern-context-menu';
import { AddPatternContextMenuTrigger } from './add-pattern-context-menu/add-pattern-context-menu-trigger';
import { bookMetadata } from './book-metadata';
import { createNewTestmentObjectBase } from './create-new-testment-fn';
import { createOldTestmentObjectBase } from './create-old-testment-fn';
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
import { LexicalPipe } from './editor/shared/lexical-pipe';
import { VersePipe } from './editor/shared/verse-pipe';
import { GematricsPipe } from './gematrics-pipe';
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

  hebraicMetadata!: Codex<object, CodexBookVerse<CodexBookChapterVerseMetadata>>;
  greekMetadata!: Codex<object, CodexBookVerse<CodexBookChapterVerseMetadata>>;

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

  constructor(
    private cd: ChangeDetectorRef,
    private documentStorage: DocumentStorage,
    private translationService: TranslationService
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
}
