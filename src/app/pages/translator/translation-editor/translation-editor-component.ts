import { HttpClient } from '@angular/common/http';
import { AsyncPipe } from '@angular/common';
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
import { getProjectLanguageFn } from '@shared/language-metadata/get-project-language-fn';
import { ProjectNavigationToolbox } from '@shared/project-navigation-toolbox/project-navigation-toolbox';
import { PendingLexiconNavigationToolbox } from '@shared/pending-lexicon-navigation-toolbox/pending-lexicon-navigation-toolbox';
import { getProjectSourcesFn } from '@shared/project/get-project-sources-fn';
import { getProjectTargetsFn } from '@shared/project/get-project-targets-fn';
import { getProjectTargetsMetadataDetailsFn } from '@shared/project/get-project-targets-metadata-details-fn';
import { getProjectTranslationsDetailsFn } from '@shared/project/get-project-translations-details-fn';
import { loadCodexMetadataFn } from '@shared/project/load-codex-metadata-fn';
import { loadSourceBookFn } from '@shared/project/load-source-book-fn';
import { SystemService } from '@shared/system/system-service';
import { ToolboxVisibilityService } from '@shared/toolbox/toolbox-visibility-service';
import { LoadingObservable } from '@shared/loading/loading-observable';
import { debounceTime, Subscription } from 'rxjs';
import { AddPatternContextMenu } from '../add-pattern-context-menu/add-pattern-context-menu';
import { ImportFromBookDialog } from '../import-from-book-dialog/import-from-book-dialog';
import { CodexConfigDialog } from '../codex-config-dialog/codex-config-dialog';
import { ViewingTranslationDialog } from '../viewing-translation-dialog/viewing-translation-dialog';
import { ScriptureMetadataComponent } from './scripture-metadata/scripture-metadata-component';
import { ProjectMetadataService } from './shared/project/project-metadata-service';
import { isPendingLexical } from './shared/project/pending-lexical';
import { DefineFieldMorphemeRuleContextMenu } from '../define-field-morpheme-rule-context-menu/define-field-morpheme-rule-context-menu';
import { InterlinearToolsContextMenu } from '../interlinear-tools-context-menu/interlinear-tools-context-menu';
import { PinnedRowsFooter } from './pinned-rows-footer/pinned-rows-footer';
import { PinnedRowsService } from './pinned-rows-service';

@Component({
  selector: 'app-translation-editor-component',
  imports: [
    AsyncPipe,
    FormsModule,
    AsyncModalModule,
    ScriptureMetadataComponent,
    ProjectNavigationToolbox,
    AddPatternContextMenu,
    DefineFieldMorphemeRuleContextMenu,
    InterlinearToolsContextMenu,
    PinnedRowsFooter,
    PendingLexiconNavigationToolbox
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
  private removeMenuListeners: Array<() => void> = [];
  private removeImmediateSaveHandler: (() => void) | null = null;
  private activeSave: Promise<void> | null = null;
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
    private pinnedRows: PinnedRowsService,
    readonly toolboxVisibility: ToolboxVisibilityService
  ) { }

  ngOnInit(): void {
    this.removeImmediateSaveHandler = this.systemService.registerImmediateSaveHandler(
      () => this.saveCurrentPageImmediately()
    );
    this.removeMenuListeners.push(window.api.onOpenCodexConfig(source => {
      this.openCodexConfigForSource(source);
    }));
    this.removeMenuListeners.push(window.api.onOpenProjectMenuAction(action => {
      if (action === 'viewing-translation') {
        this.openViewingTranslationDialog();
      } else if (action === 'import-from-book') {
        this.openImportFromBookDialog();
      } else if (action === 'preview-current') {
        void this.openCurrentPreview();
      }
    }));
    this.subscribeData();
    this.subscribeSaveBookMetadata();
    this.subscribeSaveBookInterlinear();
    this.subscribeSaveBookCustomTranslation();
  }

  private async openCurrentPreview(): Promise<void> {
    if (!this.current) {
      return;
    }

    try {
      await this.saveCurrentPageImmediately();
      const currentVerse = this.getCurrentVisibleVerse();
      const navigated = await this.router.navigateByUrl(
        `/translator/preview/book/${encodeURIComponent(this.current.book)}/chapter/${this.current.chapter}`
        + (currentVerse ? `?verse=${currentVerse}` : '')
      );
      if (!navigated) {
        throw new Error('The Holy Viewer preview route was not activated.');
      }
    } catch (error) {
      console.error('Unable to open the Holy Viewer preview:', error);
      alert('Unable to open the preview. Check the console for details.');
    }
  }

  private getCurrentVisibleVerse(): number | null {
    const titles = Array.from(
      this.elementRef.nativeElement.querySelectorAll<HTMLElement>('h2.verseTitle[data-verse]')
    );
    const visibleTitles = titles.filter(title => title.getBoundingClientRect().top <= 1);
    const title = visibleTitles.at(-1) ?? titles[0];
    const verse = Number(title?.dataset['verse']);
    return Number.isInteger(verse) && verse > 0 ? verse : null;
  }

  ngOnDestroy(): void {
    this.removeImmediateSaveHandler?.();
    this.removeMenuListeners.forEach(removeListener => removeListener());
    void window.api.updateCodexConfigMenu([]).catch(error => {
      console.error('Unable to clear the codex config menu:', error);
    });
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

  private async saveCurrentPageImmediately(): Promise<void> {
    if (this.activeSave) {
      return this.activeSave;
    }

    const save = this.saveProjectFilesImmediately();
    this.activeSave = save;
    try {
      await save;
    } finally {
      if (this.activeSave === save) {
        this.activeSave = null;
      }
    }
  }

  private async saveProjectFilesImmediately(): Promise<void> {
    const project = this.project;
    if (!project) {
      throw new Error('Cannot save because no project is loaded');
    }

    LoadingObservable.startLoading('save');
    try {
      const currentBook = this.current ? { book: this.current.book } : null;
      await this.systemService.saveProjectImmediately(project, currentBook, this.projectData);
    } catch (error) {
      console.error('Unable to save all project files:', error);
      alert('Some project files could not be saved. Check the console for details.');
      throw error;
    } finally {
      await LoadingObservable.stopLoading();
    }
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
    this.updateCodexConfigMenu(project);
  }

  private updateCodexConfigMenu(project: Project): void {
    if (!this.codexMetadataRecord) {
      return;
    }

    const codices = this.getProjectTargetsMetadataDetails(project, this.codexMetadataRecord)
      .map(detail => ({
        source: detail.source,
        label: this.codexMetadataRecord?.[detail.source]?.name
      }))
      .filter((codex): codex is { source: string; label: string } => Boolean(codex.label));

    void window.api.updateCodexConfigMenu(codices).catch(error => {
      console.error('Unable to update the codex config menu:', error);
    });
  }

  private openCodexConfigForSource(source: string): void {
    if (!this.project || !this.codexMetadataRecord) {
      return;
    }

    const detail = this.getProjectTargetsMetadataDetails(this.project, this.codexMetadataRecord)
      .find(candidate => candidate.source === source);
    if (!detail) {
      console.error(`Unable to open codex config for unknown source "${source}"`);
      return;
    }

    const customTranslationsDetails = this.getProjectTranslationsDetails(this.project, this.codexMetadataRecord);
    this.openCodexConfigDialog(detail, customTranslationsDetails);
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
    return this.getLexicalFields().filter(field => isPendingLexical(field.value)).length;
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

      if (!(event.target instanceof HTMLElement && event.target.closest('app-pending-lexicon-navigation-toolbox'))) {
        this.lastFocusedLexicalField = null;
      }
    }
  }

  focusPendingLexicalField(direction: -1 | 1): void {
    const lexicalFields = this.getLexicalFields();
    const pendingFields = lexicalFields.filter(field => isPendingLexical(field.value));
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
    return this.getLexicalFields().filter(field => isPendingLexical(field.value));
  }

  private isLexicalField(target: EventTarget | null): target is HTMLInputElement {
    return target instanceof HTMLInputElement
      && target.matches('input[name^="fieldLexical"]')
      && this.elementRef.nativeElement.contains(target);
  }

  openImportFromBookDialog(): void {
    const project = this.project;
    const book = this.current?.book;

    if (project && this.codexMetadataRecord && book) {
      const targetMetadataDetails = this.getProjectTargetsMetadataDetails(project, this.codexMetadataRecord);
      this.modalService
        .createModal(ImportFromBookDialog)
        .setBindToRoute(this.router)
        .setOutletName('main')
        .setData({
          title: 'Import from Book',
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

  openViewingTranslationDialog(): void {
    const project = this.project;
    const codexMetadataRecord = this.codexMetadataRecord;
    if (!project || !codexMetadataRecord) {
      return;
    }

    this.modalService
      .createModal(ViewingTranslationDialog)
      .setBindToRoute(this.router)
      .setOutletName('main')
      .setData({
        title: 'Viewing Translation',
        project,
        codexMetadataRecord,
        repositories: this.data?.['repositories']
          ?? this.activatedRoute.parent?.snapshot.data['repositories']
          ?? {}
      })
      .build()
      .subscribe({
        next: association => {
          if (association) {
            this.onAddViewingTranslation(project, association);
          }
        }
      });
  }

  openCodexConfigDialog(
    detail: TargetMetadataDetail,
    customTranslationsDetails: TargetTranslationMetadataDetail[]
  ): void {
    const book = this.current?.book;
    const bookSource = this.sourceBookRecord[detail.source];

    if (book && this.project && this.languageMetadataRecord[detail.languageSource]) {
      const bookMetadata = this.projectData[detail.target];
      const translationDetail = customTranslationsDetails.find(candidate => candidate.source === detail.source);
      const translationBook = translationDetail ? this.projectData[translationDetail.target] : null;
      let configsSaved = false;
      const saveConfigs = (): void => {
        if (configsSaved) {
          return;
        }

        configsSaved = true;
        this.systemService.triggerSaveCurrentBookMetadata({ book });
        this.systemService.triggerSaveCurrentBookInterlinear({ book });
        if (translationBook) {
          this.systemService.triggerSaveCurrentBookTranslations({ book });
        }
      };

      this.modalService
        .createModal(CodexConfigDialog)
        .setBindToRoute(this.router)
        .setOutletName('main')
        .setData({
          title: 'Codex Configuration',
          bookMetadata,
          bookSource: bookSource ?? null,
          language: getProjectLanguageFn(this.project, detail.languageSource),
          languageSource: detail.languageSource,
          currentBook: { book },
          translationBook
        })
        .build()
        .subscribe({
          next: saveConfigs,
          complete: saveConfigs
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
