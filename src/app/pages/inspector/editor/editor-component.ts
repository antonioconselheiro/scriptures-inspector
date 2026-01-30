import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { AsyncModalModule, ModalService } from '@belomonte/async-modal-ngx';
import { BookMetadataAttributes } from '@domain/book-metadata-attributes-model';
import { Codex } from '@domain/codex-model';
import { CurrentChapter } from '@domain/current-chapter-model';
import { KeyInterlinear } from '@domain/key-interlinear-type';
import { KeyMetadata } from '@domain/key-metadata-type';
import { KeyTranslation } from '@domain/key-translation-type';
import { Language } from '@domain/language-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { ParsedBookMetadata } from '@domain/parsed-book-metadata-model';
import { ProjectData } from '@domain/project-data-model';
import { Project } from '@domain/project-model';
import { SourceBook } from '@domain/source-book-model';
import { TargetMetadataDetail } from '@domain/target-metadata-detail-model';
import { languageMetadataRecord } from '@shared/language-metadata/language-metadata-record';
import { getProjectFn } from '@shared/project/get-project-fn';
import { getProjectSourcesFn } from '@shared/project/get-project-sources-fn';
import { getProjectTargetsFn } from '@shared/project/get-project-targets-fn';
import { getProjectTargetsMetadataDetailsFn } from '@shared/project/get-project-targets-metadata-details-fn';
import { SystemService } from '@shared/system/system-service';
import { debounceTime, Subscription } from 'rxjs';
import { AddPatternContextMenu } from '../add-pattern-context-menu/add-pattern-context-menu';
import { DialogLexicalDictionary } from '../dialog-lexical-dictionary/dialog-lexical-dictionary';
import { DialogPatterns } from '../dialog-patterns/dialog-patterns';
import { InterlinearComponent } from './interlinear/interlinear-component';
import { ScriptureMetadataComponent } from './scripture-metadata/scripture-metadata-component';
import { ProjectMetadataService } from './shared/project/project-metadata-service';
import { VerseNumberPipe } from './shared/verse-number-pipe';
import { TranslationViewerManager } from './translation-viewer-manager/translation-viewer-manager';

@Component({
  selector: 'app-editor-component',
  imports: [
    VerseNumberPipe,
    FormsModule,
    AsyncModalModule,
    AddPatternContextMenu,
    ScriptureMetadataComponent,
    TranslationViewerManager,
    InterlinearComponent
  ],
  templateUrl: './editor-component.html',
  styleUrl: './editor-component.scss'
})
export class EditorComponent implements OnInit, OnDestroy {

  project!: Project;

  current: CurrentChapter | null = null;

  formSelectedBook: string = '';
  formSelectedChapter: number | null = null;

  showLegend = false;
  minimized = true;
  pipeUpdaterController = 1;

  projectData: ProjectData = {};

  codexMetadataRecord: {
    [source: string]: Codex<LanguageUnionType>
  } = {};

  sourceBookRecord: {
    readonly [source: string]: SourceBook | undefined
  } = {};

  translationBookRecord: {
    readonly [source: string]: Readonly<SourceBook> | undefined
  } = {};

  readonly languageMetadataRecord = languageMetadataRecord;
  readonly autoSaveDebounceTime = 5000;

  private subscriptions = new Subscription();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private modalService: ModalService,
    private systemService: SystemService,
    protected projectMetadataService: ProjectMetadataService
  ) { }

  ngOnInit(): void {
    this.readProjectFromSession();
    this.subscribeData();
    this.subscribeParams();
    this.subscribeSaveProject();
    this.subscribeSaveBookMetadata();
    this.subscribeSaveBookInterlinear();
    this.subscribeSaveBookCustomTranslation();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private readProjectFromSession(): void {
    const project = getProjectFn();
    if (project) {
      this.project = project;
    } else {
      this.router.navigate(['open']);
    }
  }

  private subscribeParams(): void {
    this.subscriptions.add(this.activatedRoute.params.subscribe({
      next: params => {
        const book = params['book'].toUpperCase();
        const chapter = Number(params['chapter']) - 1;

        this.formSelectedBook = book;
        this.formSelectedChapter = chapter;

        if (!this.current) {
          this.current = {
            book, chapter
          };
        } else {
          this.current.book = book;
          this.current.chapter = chapter;
        }
      }
    }));
  }

  private subscribeData(): void {
    this.subscriptions.add(this.activatedRoute.data.subscribe({
      next: data => {
        this.readBookSourceFromData(data);
        this.readBookTranslationViewerFromData(data);
        this.readBookTargetsFromData(data);
      }
    }));
  }

  private subscribeSaveProject(): void {
    this.subscriptions.add(SystemService
      .saveCurrentProject
      .asObservable()
      .pipe(debounceTime(this.autoSaveDebounceTime))
      .subscribe({
        next: () => this.systemService.saveProjectConfig()
      }));
  }

  private subscribeSaveBookMetadata(): void {
    this.subscriptions.add(SystemService
      .saveCurrentBookMetadata
      .asObservable()
      .pipe(debounceTime(this.autoSaveDebounceTime))
      .subscribe({
        next: currentBook => this.systemService.saveCurrentBookMetadata(this.project, currentBook, this.projectData)
      }));
  }

  private subscribeSaveBookInterlinear(): void {
    this.subscriptions.add(SystemService
      .saveCurrentBookInterlinear
      .asObservable()
      .pipe(debounceTime(this.autoSaveDebounceTime))
      .subscribe({
        next: currentBook => this.systemService.saveCurrentBookInterlinear(this.project, currentBook, this.projectData)
      }));
  }

  private subscribeSaveBookCustomTranslation(): void {
    this.subscriptions.add(SystemService
      .saveCurrentBookCustomTranslations
      .asObservable()
      .pipe(debounceTime(this.autoSaveDebounceTime))
      .subscribe({
        next: currentBook => this.systemService.saveCurrentBookCustomTranslation(this.project, currentBook, this.projectData)
      }));
  }

  private readBookSourceFromData(data: Data): void {
    const sources = this.getProjectSources();
    const sourceBookRecord: { [source: string]: SourceBook | undefined } = {};

    sources.forEach(source => {
      sourceBookRecord[source] = data['sources'][source];
      this.codexMetadataRecord[source] = data['codex'][source];
    });

    this.sourceBookRecord = sourceBookRecord;
  }

  private readBookTranslationViewerFromData(data: Data): void {
    const translationBookRecord: { [source: string]: SourceBook | undefined } = {};

    this.project.translationViewer.forEach(source => {
      translationBookRecord[source] = data['sources'][source];
      this.codexMetadataRecord[source] = data['codex'][source];
    });

    this.translationBookRecord = translationBookRecord;
  }

  private readBookTargetsFromData(data: Data): void {
    const targets = this.getProjectTargets();
    const projectData: ProjectData = {};

    targets.forEach(target => {
      projectData[target] = data['targets'][target];
      this.codexMetadataRecord[target] = data['codex'][target];
    });
    this.projectData = projectData;
  }

  getProjectSources(): Array<string> {
    return getProjectSourcesFn(this.project);
  }

  getProjectTargets(): Array<KeyMetadata | KeyInterlinear | KeyTranslation> {
    return getProjectTargetsFn(this.project);
  }

  getProjectTargetsMetadataDetails(): Array<TargetMetadataDetail> {
    return getProjectTargetsMetadataDetailsFn(this.project, this.codexMetadataRecord);
  }

  listBookNames(): Array<{ key: string, name: string }> {
    return Object.keys(this.project.target.books).map(book => {
      return {
        key: book,
        name: this.project.target.books[book].name
      };
    });
  }

  go(): void {
    if (this.formSelectedBook && this.formSelectedChapter) {
      this.router.navigate([
        '/editor/book',
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
      '/editor/book',
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
      '/editor/book',
      book.toLowerCase(),
      'chapter',
      nextChapter
    ]);
  }

  openExternalDictionary(detail: TargetMetadataDetail): void {
    const languageMetadata = languageMetadataRecord[detail.languageSource];
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

  openDialogPatterns(detail: TargetMetadataDetail): void {
    const book = this.current?.book;

    if (book) {
      const bookMetadata = this.projectData[detail.target];
      this.modalService
        .createModal(DialogPatterns)
        .setOutletName('main')
        .setData({
          language: detail.languageSource,
          patterns: bookMetadata.patterns
        })
        .build()
        .subscribe({
          next: () => this.systemService.triggerSaveCurrentBookMetadata({ book })
        });
    }
  }

  openDialogLexicalDictionary(detail: TargetMetadataDetail): void {
    const book = this.current?.book;

    if (book) {
      const bookMetadata = this.projectData[detail.target];
      this.modalService
        .createModal(DialogLexicalDictionary)
        .setOutletName('main')
        .setData(bookMetadata)
        .build()
        .subscribe({
          next: () => this.systemService.triggerSaveCurrentBookMetadata({ book })
        });
    }
  }

  onAddViewingTranslation(viewingTranslation: string): void {
    this.project.translationViewer.push(viewingTranslation);
    this.systemService.triggerSaveCurrentProject();
  }

  parseBook(book: BookMetadataAttributes, language: Language, pipeUpdaterController: number): ParsedBookMetadata {
    pipeUpdaterController;
    const parsedPatterns = this.projectMetadataService.parsePattern(book.patterns, language);

    return {
      lexical: book.lexical,
      patterns: parsedPatterns
    };
  }
}
