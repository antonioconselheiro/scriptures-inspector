import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalService } from '@belomonte/async-modal-ngx';
import { CodexBookVerse } from '@domain/codex-book-verse-model';
import { CurrentChapter } from '@domain/current-chapter-model';
import { ParsedPatterns } from '@domain/parsed-patterns';
import { Project } from '@domain/project-model';
import { SourceBook } from '@domain/source-book-model';
import { AddPatternContextMenu } from '../add-pattern-context-menu/add-pattern-context-menu';
import { DialogDictionary } from '../dialog-dictionary/dialog-lexical-dictionary';
import { DialogPatterns } from '../dialog-patterns/dialog-patterns';
import { TranslationBookVerse } from '../domain/translation-book-verse-model';
import { ScriptureMetadataComponent } from './scripture-inspector/scripture-metadata-component';
import { TranslationInspectorComponent } from './translation-inspector/interlinear-translation-component';
import { LanguageUnionType } from '@domain/language-union-type';
import { languageMetadataRecord } from '@shared/language-metadata/language-metadata-record';

@Component({
  selector: 'app-editor-component',
  imports: [
    FormsModule,
    AddPatternContextMenu,
    ScriptureMetadataComponent,
    TranslationInspectorComponent
  ],
  templateUrl: './editor-component.html',
  styleUrl: './editor-component.scss'
})
export class EditorComponent implements OnInit {

  @Input()
  project!: Project;

  @Input()
  current!: CurrentChapter;

  @Input()
  sourceBook!: SourceBook;

  @Input()
  sourceVerse!: CodexBookVerse<{ text: string; }>

  @Input()
  chapterTranslations!: Array<Array<TranslationBookVerse>>;

  @Input()
  addPatternMenuRef!: AddPatternContextMenu;

  selectedBook: string = '';
  selectedChapter: number | null = null;

  currentBook!: string;
  currentChapter!: number;

  showLegend = false;
  minimized = true;
  pipeUpdaterController = 1;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.readMetadata();
    this.readPatterns();
    this.readInterlineares();
    this.subscribeData();
    this.subscribeParams();
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

  openExternalDictionary(language: LanguageUnionType): void {
    const languageMetadata = languageMetadataRecord[language];
    if (languageMetadata.externalDictionaryLink) {
      open(languageMetadata.externalDictionaryLink, '_BLANK');
    } else {
      alert(`${languageMetadata.name} external dictionary not configured`);
    }
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
      this.hebraicPatterns = this.documentStorage.addHebraicPattern(demassoretifier(option.word), option.type);
    } else if (option.lang === 'geez') {
      this.geezPatterns = this.documentStorage.addGeezPattern(option.word, option.type);
    } else if (option.lang === 'greek') {
      this.greekPatterns = this.documentStorage.addGreekPattern(option.word, option.type);
    }
  }
}
