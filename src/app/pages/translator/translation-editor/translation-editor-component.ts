import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Data } from '@angular/router';
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
import { TargetTranslationMetadataDetail } from '@domain/target-translation-metadata-detail-model';
import { TranslationViewing } from '@domain/translation-viewing-model';
import { languageMetadataRecord } from '@shared/language-metadata/language-metadata-record';
import { ProjectHeader } from '@shared/project-header/project-header';
import { getProjectSourcesFn } from '@shared/project/get-project-sources-fn';
import { getProjectTargetsFn } from '@shared/project/get-project-targets-fn';
import { getProjectTargetsMetadataDetailsFn } from '@shared/project/get-project-targets-metadata-details-fn';
import { getProjectTranslationsDetailsFn } from '@shared/project/get-project-translations-details-fn';
import { loadCodexMetadataFn } from '@shared/project/load-codex-metadata-fn';
import { loadSourceBookFn } from '@shared/project/load-source-book-fn';
import { SystemService } from '@shared/system/system-service';
import { debounceTime, Subscription } from 'rxjs';
import { AddPatternContextMenu } from '../add-pattern-context-menu/add-pattern-context-menu';
import { ImportFromBookDialog } from '../import-from-book-dialog/import-from-book-dialog';
import { LexicalDictionaryDialog } from '../lexical-dictionary-dialog/lexical-dictionary-dialog';
import { PatternsDialog } from '../patterns-dialog/patterns-dialog';
import { TranslationVariationConfigDialog } from '../translation-variation-config-dialog/translation-variation-config-dialog';
import { InterlinearComponent } from './interlinear/interlinear-component';
import { ScriptureMetadataComponent } from './scripture-metadata/scripture-metadata-component';
import { ProjectMetadataService } from './shared/project/project-metadata-service';
import { VerseNumberPipe } from './shared/verse-number-pipe';
import { TranslationViewerManager } from './translation-viewer-manager/translation-viewer-manager';

@Component({
  selector: 'app-translation-editor-component',
  imports: [
    VerseNumberPipe,
    FormsModule,
    AsyncModalModule,
    AddPatternContextMenu,
    ScriptureMetadataComponent,
    TranslationViewerManager,
    InterlinearComponent,
    ProjectHeader
  ],
  templateUrl: './translation-editor-component.html',
  styleUrl: './translation-editor-component.scss'
})
export class TranslationEditorComponent implements OnInit, OnDestroy {

  project: Project | null = null;
  current: CurrentChapter | null = null;
  data: Data | null = null;
  projectData: ProjectData = {};

  pipeUpdaterController = 1;

  codexMetadataRecord: {
    [source: string]: Codex<LanguageUnionType>
  } | null = null;

  sourceBookRecord: {
    readonly [source: string]: SourceBook | undefined
  } = {};

  translationBookRecord: {
    [source: string]: TranslationViewing;
  } = {};

  readonly languageMetadataRecord = languageMetadataRecord;

  private subscriptions = new Subscription();

  constructor(
    private httpClient: HttpClient,
    private activatedRoute: ActivatedRoute,
    private modalService: ModalService,
    private systemService: SystemService,
    protected projectMetadataService: ProjectMetadataService
  ) { }

  ngOnInit(): void {
    this.subscribeData();
    this.subscribeSaveBookMetadata();
    this.subscribeSaveBookInterlinear();
    this.subscribeSaveBookCustomTranslation();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private subscribeData(): void {
    this.subscriptions.add(this.activatedRoute.data.subscribe({
      next: data => {
        this.data = data;
        this.onDataLoaded();
      }
    }));
  }

  onProjectChange(project: Project): void {
    this.project = project;
    this.onDataLoaded();
  }

  onDataLoaded(): void {
    console.info('[onDataLoaded]', {
      project: this.project,
      data: this.data,
    });

    if (this.project && this.data) {
      this.readBookSourceFromData(this.project, this.data);
      this.readBookTranslationViewerFromData(this.project, this.data);
      this.readBookTargetsFromData(this.project, this.data);
    }
  }

  private subscribeSaveBookMetadata(): void {
    this.subscriptions.add(SystemService
      .saveCurrentBookMetadata
      .asObservable()
      .pipe(debounceTime(SystemService.autoSaveDebounceTime))
      .subscribe({
        next: currentBook => {
          if (this.project) {
            this.systemService.saveCurrentBookMetadata(this.project, currentBook, this.projectData);
          }
        }
      }));
  }

  private subscribeSaveBookInterlinear(): void {
    this.subscriptions.add(SystemService
      .saveCurrentBookInterlinear
      .asObservable()
      .pipe(debounceTime(SystemService.autoSaveDebounceTime))
      .subscribe({
        next: currentBook => {
          if (this.project) {
            this.systemService.saveCurrentBookInterlinear(this.project, currentBook, this.projectData);
          }
        }
      }));
  }

  private subscribeSaveBookCustomTranslation(): void {
    this.subscriptions.add(SystemService
      .saveCurrentBookCustomTranslations
      .asObservable()
      .pipe(debounceTime(SystemService.autoSaveDebounceTime))
      .subscribe({
        next: currentBook => {
          if (this.project) {
            this.systemService.saveCurrentBookCustomTranslation(this.project, currentBook, this.projectData);
          }
        }
      }));
  }

  private readBookSourceFromData(project: Project, data: Data): void {
    const sources = this.getProjectSources(project);
    const sourceBookRecord: { [source: string]: SourceBook | undefined } = {};

    sources.forEach(source => {
      sourceBookRecord[source] = data['sources'][source];
      if (!this.codexMetadataRecord) {
        this.codexMetadataRecord = {};
      }

      this.codexMetadataRecord[source] = data['codex'][source];
    });

    this.sourceBookRecord = sourceBookRecord;
  }

  private readBookTranslationViewerFromData(project: Project, data: Data): void {
    this.translationBookRecord = {};
    if (!project.translationViewer) {
      return;
    }

    project.translationViewer
      .forEach(source => this.applyViewingTranslation(source, data['sources'][source], data['codex'][source]));
  }

  private applyViewingTranslation(source: string, translationViewing: TranslationViewing, codex: Codex<LanguageUnionType>): void {
    this.translationBookRecord[source] = { ...translationViewing };
    this.translationBookRecord[source].name = codex.name;
    this.translationBookRecord[source].source = source;
    if (!this.codexMetadataRecord) {
      this.codexMetadataRecord = {};
    }

    this.codexMetadataRecord[source] = codex;
  }

  private readBookTargetsFromData(project: Project, data: Data): void {
    const targets = this.getProjectTargets(project);
    const projectData: ProjectData = {};

    targets.forEach(target => {
      projectData[target] = data['targets'][target];
      if (!this.codexMetadataRecord) {
        this.codexMetadataRecord = {};
      }

      this.codexMetadataRecord[target] = data['codex'][target];
    });

    this.projectData = projectData;
  }

  getProjectSources(project: Project): Array<string> {
    return getProjectSourcesFn(project);
  }

  getProjectTargets(project: Project): Array<KeyMetadata | KeyInterlinear | KeyTranslation> {
    return getProjectTargetsFn(project);
  }

  getProjectTargetsMetadataDetails(
    project: Project, codexMetadataRecord: { [source: string]: Codex<LanguageUnionType> }
  ): Array<TargetMetadataDetail> {
    return getProjectTargetsMetadataDetailsFn(project, codexMetadataRecord);
  }

  getProjectTranslationsDetails(
    project: Project, codexMetadataRecord: { [source: string]: Codex<LanguageUnionType> }
  ): Array<TargetTranslationMetadataDetail> {
    return getProjectTranslationsDetailsFn(project, codexMetadataRecord);
  }

  getChapterIndex(current: CurrentChapter, chapters: Array<{ chapter: number; }>): number {
    return chapters.findIndex(chapter => chapter.chapter === current.chapter);
  }

  openImportFromBookDialog(project: Project, targetMetadataDetails: TargetMetadataDetail[]): void {
    const book = this.current?.book;

    if (book) {
      this.modalService
        .createModal(ImportFromBookDialog)
        .setOutletName('main')
        .setData({
          targetMetadataDetails,
          project: project,
          projectData: this.projectData,
          book: book
        })
        .build()
        .subscribe({
          next: () => {
            this.systemService.triggerSaveCurrentBookMetadata({ book });
            this.systemService.triggerSaveCurrentBookInterlinear({ book });
          }
        });
    }
  }

  openPatternsDialog(detail: TargetMetadataDetail): void {
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
          next: () => {
            this.systemService.triggerSaveCurrentBookMetadata({ book });
            this.systemService.triggerSaveCurrentBookInterlinear({ book });
          }
        });
    }
  }

  openLexicalDictionaryDialog(detail: TargetMetadataDetail): void {
    const book = this.current?.book;
    const bookSource = this.sourceBookRecord[detail.source];

    if (book && bookSource) {
      const bookMetadata = this.projectData[detail.target];
      this.modalService
        .createModal(LexicalDictionaryDialog)
        .setOutletName('main')
        .setData({
          bookMetadata,
          bookSource,
          language: this.languageMetadataRecord[detail.languageSource]
        })
        .build()
        .subscribe({
          next: () => {
            this.systemService.triggerSaveCurrentBookMetadata({ book });
            this.systemService.triggerSaveCurrentBookInterlinear({ book });
          }
        });
    }
  }

  openTranslationVariationsConfigDialog(detail: TargetTranslationMetadataDetail): void {
    const book = this.current?.book;

    if (book) {
      const bookMetadata = this.projectData[detail.target];
      this.modalService
        .createModal(TranslationVariationConfigDialog)
        .setOutletName('main')
        .setData(bookMetadata)
        .build()
        .subscribe({
          complete: () => this.systemService.triggerSaveCurrentBookTranslations({ book })
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

  onAddViewingTranslation(project: Project, source: string): void {
    const book = this.current?.book;

    if (book) {
      loadCodexMetadataFn(this.httpClient, project, source)
        .then(codex => {
          if (codex) {
            loadSourceBookFn(this.httpClient, project, source, book).then(sourceBook => {
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

    if (!project.translationViewer) {
      project.translationViewer = [];
    }

    project.translationViewer.push(source);
    this.systemService.triggerSaveCurrentProject();
  }

  onRemoveTranslation(project: Project, source: string): void {
    if (confirm('Confirm removing this translation viewing?')) {
      delete this.translationBookRecord[source];
      if (project.translationViewer) {
        project.translationViewer.splice(project.translationViewer.indexOf(source), 1);
      }
      this.systemService.triggerSaveCurrentProject();
    }
  }
}
