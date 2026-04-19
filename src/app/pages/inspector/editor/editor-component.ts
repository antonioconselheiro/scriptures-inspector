import { HttpClient } from '@angular/common/http';
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
import { TranslationViewing } from '@domain/translation-viewing-model';
import { languageMetadataRecord } from '@shared/language-metadata/language-metadata-record';
import { LoadingObservable } from '@shared/loading/loading-service';
import { getProjectFn } from '@shared/project/get-project-fn';
import { getProjectSourcesFn } from '@shared/project/get-project-sources-fn';
import { getProjectTargetsFn } from '@shared/project/get-project-targets-fn';
import { getProjectTargetsMetadataDetailsFn } from '@shared/project/get-project-targets-metadata-details-fn';
import { loadCodexMetadataFn } from '@shared/project/load-codex-metadata-fn';
import { loadSourceBookFn } from '@shared/project/load-source-book-fn';
import { SystemService } from '@shared/system/system-service';
import { debounceTime, Subscription } from 'rxjs';
import { AddPatternContextMenu } from '../add-pattern-context-menu/add-pattern-context-menu';
import { ImportFromBookDialog } from '../import-from-book-dialog/import-from-book-dialog';
import { LexicalDictionaryDialog } from '../lexical-dictionary-dialog/lexical-dictionary-dialog';
import { PatternsDialog } from '../patterns-dialog/patterns-dialog';
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
    [source: string]: TranslationViewing;
  } = {};

  readonly languageMetadataRecord = languageMetadataRecord;
  readonly autoSaveDebounceTime = 5000;

  private subscriptions = new Subscription();

  constructor(
    private router: Router,
    private httpClient: HttpClient,
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
      const path = ['open'];
      console.log(`[navigate]`, path.join('/'));
      LoadingObservable.startLoading();
      this.router.navigate(path)
        .catch(e => console.error(e))
        .finally(() => LoadingObservable.stopLoading());
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
        next: () => {
          this.systemService.saveProjectConfig(this.project);
        }
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
    this.translationBookRecord = {};
    if (!this.project.translationViewer) {
      return;
    }

    this.project.translationViewer
      .forEach(source => this.applyViewingTranslation(source, data['sources'][source], data['codex'][source]));
  }

  private applyViewingTranslation(source: string, translationViewing: TranslationViewing, codex: Codex<LanguageUnionType>): void {
    this.translationBookRecord[source] = { ...translationViewing };
    this.translationBookRecord[source].name = codex.name;
    this.translationBookRecord[source].source = source;
    this.codexMetadataRecord[source] = codex;
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

  private notNullLike<T>(value: T | null | undefined): value is T {
    if (value === undefined || value === null) {
      return false;
    } else {
      return true;
    }
  }

  go(): void {
    if (this.notNullLike(this.formSelectedBook) && this.notNullLike(this.formSelectedChapter)) {
      const book = this.formSelectedBook;
      const goTo = (+this.formSelectedChapter) + 1;
      const path = ['/editor/book', book, 'chapter', goTo];
      console.log(`[navigate]`, path.join('/'));

      LoadingObservable.startLoading();
      this.router.navigate(path)
        .catch(e => console.error(e))
        .finally(() => LoadingObservable.stopLoading());
    }
  }

  back(): void {
    if (this.notNullLike(this.formSelectedBook) && this.notNullLike(this.formSelectedChapter) && this.formSelectedChapter !== 0) {
      this.formSelectedChapter--;
      const previousChapter = this.formSelectedChapter;
      const book = this.formSelectedBook;
      const path = ['/editor/book', book, 'chapter', previousChapter];
      console.log(`[navigate]`, path.join('/'));

      LoadingObservable.startLoading();
      this.router.navigate(path)
        .catch(e => console.error(e))
        .finally(() => LoadingObservable.stopLoading());
    }
  }

  next(): void {
    if (this.notNullLike(this.formSelectedBook) && this.notNullLike(this.formSelectedChapter)) {
      this.formSelectedChapter++;
      const nextChapter = this.formSelectedChapter;
      const book = this.formSelectedBook;
      const path = ['/editor/book', book, 'chapter', nextChapter];
      console.log(`[navigate]`, path.join('/'));

      LoadingObservable.startLoading();
      this.router.navigate(path)
        .catch(e => console.error(e))
        .finally(() => LoadingObservable.stopLoading());
    }
  }

  save(): void {
    const book = this.current?.book;

    if (book) {
      this.systemService.triggerSaveCurrentBookMetadata({ book });
      this.systemService.triggerSaveCurrentBookInterlinear({ book });
      this.systemService.triggerSaveCurrentBookTranslations({ book });
    }

    this.systemService.triggerSaveCurrentProject();
  }

  getChapters(): number[] {
    if (!this.formSelectedBook) return [];
    const length = this.getChaptersLength();

    return Array.from({ length }, (_, i) => i + 1);
  }

  getChaptersLength(): number {
    return Math.max(...Object.keys(this.sourceBookRecord).map(
      key => this.sourceBookRecord[key]?.chapters.length ? this.sourceBookRecord[key].chapters.length + 1 : 0
    ));
  }

  openDialogImportFromBook(targetMetadataDetails: TargetMetadataDetail[]): void {
    const book = this.current?.book;

    if (book) {
      this.modalService
        .createModal(ImportFromBookDialog)
        .setOutletName('main')
        .setData({
          targetMetadataDetails,
          project: this.project,
          projectData: this.projectData,
          book: book
        })
        .build()
        .subscribe({
          next: () => this.systemService.triggerSaveCurrentBookMetadata({ book })
        });
    }
  }

  openDialogPatterns(detail: TargetMetadataDetail): void {
    const book = this.current?.book;

    if (book) {
      const bookMetadata = this.projectData[detail.target];
      this.modalService
        .createModal(PatternsDialog)
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
        .createModal(LexicalDictionaryDialog)
        .setOutletName('main')
        .setData(bookMetadata)
        .build()
        .subscribe({
          next: () => this.systemService.triggerSaveCurrentBookMetadata({ book })
        });
    }
  }

  parseBook(book: BookMetadataAttributes, language: Language, pipeUpdaterController: number): ParsedBookMetadata {
    pipeUpdaterController;
    const parsedPatterns = this.projectMetadataService.parsePattern(book.patterns, language);

    return {
      lexical: book.lexical,
      patterns: parsedPatterns
    };
  }

  onAddViewingTranslation(source: string): void {
    const book = this.current?.book;

    if (book) {
      loadCodexMetadataFn(this.httpClient, this.project, source)
        .then(codex => {
          if (codex) {
            loadSourceBookFn(this.httpClient, this.project, source, book).then(sourceBook => {
              if (sourceBook?.chapters) {
                const translationViewing: TranslationViewing = {
                  ...sourceBook,
                  source,
                  name: codex.name
                };

                this.applyViewingTranslation(source, translationViewing, codex);
              } else {
                console.warn('Can\'t show added translation, codex is null');
              }
            });
          } else {
            console.warn('Can\'t show added translation, codex is null');
          }
        });
    } else {
      console.warn('Can\'t load translation, current book is not set');
    }

    if (!this.project.translationViewer) {
      this.project.translationViewer = [];
    }

    this.project.translationViewer.push(source);
    this.systemService.triggerSaveCurrentProject();
  }

  onRemoveTranslation(source: string): void {
    if (confirm('Confirm removing this translation viewing?')) {
      delete this.translationBookRecord[source];
      if (this.project.translationViewer) {
        this.project.translationViewer.splice(this.project.translationViewer.indexOf(source), 1);
      }
      this.systemService.triggerSaveCurrentProject();
    }
  }
}
