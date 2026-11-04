import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { AsyncModalModule, ModalService } from '@belomonte/async-modal-ngx';
import { AssociatedTranslation } from '@domain/associated-translation-model';
import { Codex } from '@domain/codex-model';
import { CurrentChapter } from '@domain/current-chapter-model';
import { KeyInterlinear } from '@domain/key-interlinear-type';
import { KeyMetadata } from '@domain/key-metadata-type';
import { KeyTranslation } from '@domain/key-translation-type';
import { LanguageUnionType } from '@domain/language-union-type';
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
import { ScriptureMetadataComponent } from './scripture-metadata/scripture-metadata-component';
import { ProjectMetadataService } from './shared/project/project-metadata-service';
import { TranslationViewerManager } from './translation-viewer-manager/translation-viewer-manager';
import { DefineFieldMorphemeRuleContextMenu } from '../define-field-morpheme-rule-context-menu/define-field-morpheme-rule-context-menu';
import { InterlinearToolsContextMenu } from '../interlinear-tools-context-menu/interlinear-tools-context-menu';
import { VerseScrollNavigator } from './verse-scroll-navigator/verse-scroll-navigator';
import { PinnedRowsFooter } from './pinned-rows-footer/pinned-rows-footer';
import { PinnedRowsService } from './pinned-rows-service';

@Component({
  selector: 'app-translation-editor-component',
  imports: [
    FormsModule,
    AsyncModalModule,
    ScriptureMetadataComponent,
    TranslationViewerManager,
    ProjectHeader,
    AddPatternContextMenu,
    DefineFieldMorphemeRuleContextMenu,
    InterlinearToolsContextMenu,
    VerseScrollNavigator,
    PinnedRowsFooter
],
  providers: [PinnedRowsService],
  templateUrl: './translation-editor-component.html',
  styleUrl: './translation-editor-component.scss'
})
export class TranslationEditorComponent implements OnInit, OnDestroy {

  project: Project | null = null;
  current: CurrentChapter | null = null;
  data: Data | null = null;
  projectData: ProjectData = {};

  pipeUpdaterController = 1;

  codexMetadataRecord: { [source: string]: Codex<LanguageUnionType> } | null = null;

  sourceBookRecord: { readonly [source: string]: SourceBook | undefined } = {};

  translationBookRecord: {
    [source: string]: TranslationViewing;
  } = {};

  minifiedFieldset: {
    [index: number]: boolean;
  } = {};

  readonly languageMetadataRecord = languageMetadataRecord;

  private subscriptions = new Subscription();
  private focusedLexicalField: HTMLInputElement | null = null;
  private lastFocusedLexicalField: HTMLInputElement | null = null;

  constructor(
    private router: Router,
    private httpClient: HttpClient,
    private activatedRoute: ActivatedRoute,
    private modalService: ModalService,
    private systemService: SystemService,
    protected metadataService: ProjectMetadataService,
    private elementRef: ElementRef<HTMLElement>,
    private pinnedRows: PinnedRowsService
  ) { }

  ngOnInit(): void {
    this.subscribeData();
    this.subscribeSaveBookMetadata();
    this.subscribeSaveBookInterlinear();
    this.subscribeSaveBookCustomTranslation();
  }

  ngOnDestroy(): void {
    this.pinnedRows.clear();
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

  onCurrentChapterChange(current: CurrentChapter): void {
    this.pinnedRows.clear();
    this.current = current;
    this.minifiedFieldset = {};
    this.focusedLexicalField = null;
    this.lastFocusedLexicalField = null;
  }

  onDataLoaded(): void {
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
            this.systemService.saveCurrentBookInterlinear(this.project, this.project.structures, currentBook, this.projectData);
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

    project.translationViewer.forEach(association => {
      this.applyViewingTranslation(
        association,
        data['sources'][association.translation],
        data['codex'][association.translation]
      )
    });
  }

  private applyViewingTranslation(
    associatingTranslation: AssociatedTranslation,
    translationViewing: TranslationViewing,
    translationCodexObject: Codex<LanguageUnionType>
  ): void {
    if (!this.translationBookRecord[associatingTranslation.translation]) {
      this.translationBookRecord[associatingTranslation.translation] = { ...translationViewing };
      this.translationBookRecord[associatingTranslation.translation].name = translationCodexObject.name;
      this.translationBookRecord[associatingTranslation.translation].source = associatingTranslation.translation;
      if (!this.codexMetadataRecord) {
        this.codexMetadataRecord = {};
      }
  
      this.codexMetadataRecord[associatingTranslation.translation] = translationCodexObject;
    }

    const associatedTo = this.translationBookRecord[associatingTranslation.translation].associatedTo || [];
    this.translationBookRecord[associatingTranslation.translation].associatedTo = [
      ...new Set([...associatedTo, ...associatingTranslation.associatedTo])
    ];
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
    return getProjectSourcesFn(project.structures);
  }

  getProjectTargets(project: Project): Array<KeyMetadata | KeyInterlinear | KeyTranslation> {
    return getProjectTargetsFn(project.structures);
  }

  getProjectTargetsMetadataDetails(
    project: Project, codexMetadataRecord: { [source: string]: Codex<LanguageUnionType> }
  ): Array<TargetMetadataDetail> {
    return getProjectTargetsMetadataDetailsFn(project.structures, project.target, codexMetadataRecord);
  }

  getProjectTranslationsDetails(
    project: Project, codexMetadataRecord: { [source: string]: Codex<LanguageUnionType> }
  ): Array<TargetTranslationMetadataDetail> {
    return getProjectTranslationsDetailsFn(project.structures, project.target, codexMetadataRecord);
  }

  getChapterIndex(current: CurrentChapter, chapters: Array<{ chapter: number; }>): number {
    return chapters.findIndex(chapter => chapter.chapter === current.chapter);
  }

  get pendingLexicalFieldCount(): number {
    return this.getLexicalFields().filter(field => !field.value.trim()).length;
  }

  get focusedLexicalFieldNumber(): number {
    const pendingFields = this.getPendingLexicalFields();
    const activeField = this.focusedLexicalField || this.lastFocusedLexicalField;
    const pendingFieldIndex = activeField ? pendingFields.indexOf(activeField) : -1;
    return pendingFieldIndex < 0 ? 0 : pendingFieldIndex + 1;
  }

  @HostListener('document:focusin', ['$event'])
  onDocumentFocusIn(event: FocusEvent): void {
    if (this.isLexicalField(event.target)) {
      this.focusedLexicalField = event.target;
      this.lastFocusedLexicalField = event.target;
    } else {
      this.focusedLexicalField = null;

      if (!(event.target instanceof HTMLElement && event.target.closest('.editorFloatingControls'))) {
        this.lastFocusedLexicalField = null;
      }
    }
  }

  focusPendingLexicalField(direction: -1 | 1): void {
    const lexicalFields = this.getLexicalFields();
    const pendingFields = lexicalFields.filter(field => !field.value.trim());
    if (!pendingFields.length) {
      return;
    }

    const focusedFieldIndex = this.lastFocusedLexicalField
      ? lexicalFields.indexOf(this.lastFocusedLexicalField)
      : -1;
    const nextField = direction === 1
      ? pendingFields.find(field => lexicalFields.indexOf(field) > focusedFieldIndex) || pendingFields[0]
      : [...pendingFields].reverse().find(field => lexicalFields.indexOf(field) < focusedFieldIndex)
        || pendingFields[pendingFields.length - 1];

    nextField.focus();
  }

  private getLexicalFields(): Array<HTMLInputElement> {
    return Array.from(
      this.elementRef.nativeElement.querySelectorAll<HTMLInputElement>('input[name^="fieldLexical"]')
    );
  }

  private getPendingLexicalFields(): Array<HTMLInputElement> {
    return this.getLexicalFields().filter(field => !field.value.trim());
  }

  private isLexicalField(target: EventTarget | null): target is HTMLInputElement {
    return target instanceof HTMLInputElement
      && target.matches('input[name^="fieldLexical"]')
      && this.elementRef.nativeElement.contains(target);
  }

  openImportFromBookDialog(project: Project, targetMetadataDetails: TargetMetadataDetail[]): void {
    const book = this.current?.book;

    if (book) {
      this.modalService
        .createModal(ImportFromBookDialog)
        .setBindToRoute(this.router)
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
        .setBindToRoute(this.router)
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
        .setBindToRoute(this.router)
        .setOutletName('main')
        .setData({
          bookMetadata,
          bookSource,
          language: this.languageMetadataRecord[detail.languageSource],
          currentBook: { book }
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
        .setBindToRoute(this.router)
        .setOutletName('main')
        .setData(bookMetadata)
        .build()
        .subscribe({
          complete: () => this.systemService.triggerSaveCurrentBookTranslations({ book })
        });
    }
  }

  onAddViewingTranslation(project: Project, associating: AssociatedTranslation): void {
    const book = this.current?.book;

    if (book) {
      loadCodexMetadataFn(this.httpClient, project, associating.translation)
        .then(codex => {
          if (codex) {
            loadSourceBookFn(this.httpClient, project, associating.translation, book).then(sourceBook => {
              if (sourceBook?.chapters) {
                const translationViewing: TranslationViewing = {
                  ...sourceBook,
                  source: associating.translation,
                  associatedTo: associating.associatedTo,
                  name: codex.name
                };

                this.applyViewingTranslation(associating, translationViewing, codex);
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

    project.translationViewer.push(associating);
    this.systemService.triggerSaveCurrentProject();
  }
}
