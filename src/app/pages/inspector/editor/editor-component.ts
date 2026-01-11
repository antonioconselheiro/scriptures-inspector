import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalService } from '@belomonte/async-modal-ngx';
import { BookMetadata } from '@domain/book-metadata-model';
import { Codex } from '@domain/codex-model';
import { CodexRecord } from '@domain/codex-record';
import { CurrentChapter } from '@domain/current-chapter-model';
import { Language } from '@domain/language-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { Project } from '@domain/project-model';
import { SourceBook } from '@domain/source-book-model';
import { demassoretifier } from '@shared/language-metadata/demassoretifier-fn';
import { languageMetadataRecord } from '@shared/language-metadata/language-metadata-record';
import { getProjectSourcesFn } from '@shared/project/get-project-sources-fn';
import { SystemService } from '@shared/system/system-service';
import { AddPatternContextMenu } from '../add-pattern-context-menu/add-pattern-context-menu';
import { DialogLexicalDictionary } from '../dialog-lexical-dictionary/dialog-lexical-dictionary';
import { DialogPatterns } from '../dialog-patterns/dialog-patterns';
import { TranslationBookVerse } from '../domain/translation-book-verse-model';
import { InterlinearComponent } from './interlinear/interlinear-component';
import { ScriptureMetadataComponent } from './scripture-metadata/scripture-metadata-component';
import { ProjectMetadataService } from './shared/project/project-metadata-service';

@Component({
  selector: 'app-editor-component',
  imports: [
    FormsModule,
    AddPatternContextMenu,
    ScriptureMetadataComponent,
    InterlinearComponent
  ],
  templateUrl: './editor-component.html',
  styleUrl: './editor-component.scss'
})
export class EditorComponent implements OnInit {

  @Input()
  project!: Project;

  @Input()
  chapterTranslations!: Array<Array<TranslationBookVerse>>;

  current: CurrentChapter | null = null;

  formSelectedBook: string = '';
  formSelectedChapter: number | null = null;

  showLegend = false;
  minimized = true;
  pipeUpdaterController = 1;

  codexMetadataRecord: {
    [source: string]: Codex<LanguageUnionType>
  } = {};

  sourceBookRecord: {
    readonly [language: string]: SourceBook | null
  } = {};

  dataBookRecord: {
    [source: string]: CodexRecord<BookMetadata, object>
  } = {};

  readonly languageMetadataRecord = languageMetadataRecord;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private modalService: ModalService,
    private systemService: SystemService,
    protected projectMetadataService: ProjectMetadataService
  ) { }

  ngOnInit(): void {
    this.subscribeData();
    this.subscribeParams();
  }

  private subscribeParams(): void {
    this.activatedRoute.params.subscribe({
      next: params => {
        const book = params['book'].toUpperCase();
        const chapter = Number(params['chapter']) - 1;

        if (!this.current) {
          this.current = {
            book, chapter
          };
        } else {
          this.current.book = book;
          this.current.chapter = chapter;
        }

        this.updateChapterTranslation();
      }
    });
  }

  private subscribeData(): void {
    this.activatedRoute.data.subscribe({
      next: data => {
        const sources = this.getProjectSources();
        const sourceBookRecord: {
          [language: string]: SourceBook | null
        } = {};

        sources.forEach(source => {
          sourceBookRecord[source] = data[source];
        });

        this.sourceBookRecord = sourceBookRecord;
        this.updateChapterTranslation();
      }
    });
  }

  getProjectSources(): Array<string> {
    return getProjectSourcesFn(this.project);
  }

  listBookNames(): Array<{ key: string, name: string }> {
    const language = this.project.target.language[0];
    return Object.keys(this.project.target.books[language]).map(book => {
      return {
        key: book,
        name: this.project.target.books[language][book].name
      };
    });
  }

  go(): void {
    if (this.formSelectedBook && this.formSelectedChapter) {
      this.router.navigate([
        '/book',
        this.formSelectedBook,
        'chapter',
        (+this.formSelectedChapter) + 1
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
      book,
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

  openExternalDictionary(source: string): void {
    const language = this.codexMetadataRecord[source].lang;
    const languageMetadata = languageMetadataRecord[language];
    if (languageMetadata.externalDictionaryLink) {
      open(languageMetadata.externalDictionaryLink, '_BLANK');
    } else {
      alert(`${languageMetadata.name} external dictionary not configured`);
    }
  }

  getChapters(): number[] {
    if (!this.formSelectedBook) return [];
    const length = Math.max(...Object.keys(this.sourceBookRecord).map(
      key => this.sourceBookRecord[key]?.chapters.length ? this.sourceBookRecord[key].chapters.length + 1 : 0
    ));

    return Array.from({ length }, (_, i) => i + 1);
  }

  openDialogPatterns(source: string): void {
    this.sourceBookRecord[source]
    const lang = this.codexMetadataRecord[source].lang;
    const book = this.current?.book;

    if (book) {
      const bookMetadata = this.dataBookRecord[source][book];
      this.modalService
        .createModal(DialogPatterns)
        .setOutletName('main')
        .setData({
          lang,
          patterns: bookMetadata.patterns
        })
        .build()
        .subscribe({
          next: () => this.systemService.autoSaveCurrentProject()
        });
    }
  }

  openDialogLexicalDictionary(source: string): void {
    const bookName = this.current?.book;

    if (bookName) {
      const bookMetadata = this.dataBookRecord[source][bookName];
      this.modalService
        .createModal(DialogLexicalDictionary)
        .setOutletName('main')
        .setData(bookMetadata)
        .build()
        .subscribe({
          next: () => this.systemService.autoSaveCurrentProject()
        });
    }
  }

  onAddPattern(option: {
    word: string;
    type: 'prefix' | 'suffix';
    lang: 'hebraic' | 'geez' | 'greek';
  }): void {


    if (book) {
      const bookMetadata = this.dataBookRecord[source][book];
    }

    if (option.lang === 'hebraic') {
      this.hebraicPatterns = this.documentStorage.addHebraicPattern(demassoretifier(option.word), option.type);
    } else if (option.lang === 'geez') {
      this.geezPatterns = this.documentStorage.addGeezPattern(option.word, option.type);
    } else if (option.lang === 'greek') {
      this.greekPatterns = this.documentStorage.addGreekPattern(option.word, option.type);
    }
  }

  parseBook(book: BookMetadata, lang: Language, pipeUpdaterController: number): ParsedBookMetadata {
    pipeUpdaterController;
    const parsedPatterns = this.projectMetadataService.parsePattern(book.patterns, lang);

    return {
      lexical: book.lexical,
      patterns: parsedPatterns
    };
  }
}
