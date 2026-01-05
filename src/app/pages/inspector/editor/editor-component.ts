import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalService } from '@belomonte/async-modal-ngx';
import { CodexBookVerse } from '@domain/codex-book-verse-model';
import { CurrentChapter } from '@domain/current-chapter-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { ParsedPatterns } from '@domain/parsed-patterns';
import { Project } from '@domain/project-model';
import { SourceBook } from '@domain/source-book-model';
import { languageMetadataRecord } from '@shared/language-metadata/language-metadata-record';
import { AddPatternContextMenu } from '../add-pattern-context-menu/add-pattern-context-menu';
import { DialogDictionary } from '../dialog-dictionary/dialog-lexical-dictionary';
import { DialogPatterns } from '../dialog-patterns/dialog-patterns';
import { TranslationBookVerse } from '../domain/translation-book-verse-model';
import { ScriptureMetadataComponent } from './scripture-inspector/scripture-metadata-component';
import { TranslationInspectorComponent } from './translation-inspector/interlinear-translation-component';

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

  current: CurrentChapter | null = null;

  @Input()
  sourceBook!: SourceBook;

  @Input()
  sourceVerse!: CodexBookVerse<{ text: string; }>;

  @Input()
  chapterTranslations!: Array<Array<TranslationBookVerse>>;

  formSelectedBook: string = '';
  formSelectedChapter: number | null = null;

  showLegend = false;
  minimized = true;
  pipeUpdaterController = 1;

  selectedBook: {
    [language: string]: SourceBook | null
  } = {};

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private modalService: ModalService
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
        sources.forEach(source => {
          this.selectedBook[source] = data[source];
        });

        this.updateChapterTranslation();
      }
    });
  }

  private getProjectSources(): Array<string> {
    return this.project.structure.map(structure => {
      if (structure.translationInterlinearEditor) {
        return [structure.metadataEditor.source, ...structure.translationInterlinearEditor.map(interlinear => interlinear.source)]
      }
      return [ structure.metadataEditor.source ];
    }).flat();
  }

  getBooks(): Array<{ key: string, name: string }> {
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

  openExternalDictionary(language: LanguageUnionType): void {
    const languageMetadata = languageMetadataRecord[language];
    if (languageMetadata.externalDictionaryLink) {
      open(languageMetadata.externalDictionaryLink, '_BLANK');
    } else {
      alert(`${languageMetadata.name} external dictionary not configured`);
    }
  }

  getChapters(): number[] {
    if (!this.formSelectedBook) return [];
    const metadata = this.bookMetadata[this.formSelectedBook];
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
        .build();
    }
  }

  openDialogDictionary(lang: 'hebraic' | 'geez' | 'greek'): void {
    this.modalService
      .createModal(DialogDictionary)
      .setOutletName('main')
      .setData({
        lang
      })
      .build();
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
