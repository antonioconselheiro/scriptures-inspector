import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrentArtifact } from '@domain/current-artifact-model';
import { CurrentChapter } from '@domain/current-chapter-model';
import { FragmentCollection } from '@domain/fragment-collection-model';
import { Project } from '@domain/project-model';
import { LoadingObservable } from '@shared/loading/loading-observable';
import { getProjectFn } from '@shared/project/get-project-fn';
import { CollectionsStatefull } from '@shared/system/collections-statefull';
import { SystemService } from '@shared/system/system-service';
import { Toolbox } from '@shared/toolbox/toolbox';
import { ToolboxVisibilityService } from '@shared/toolbox/toolbox-visibility-service';
import { NavigationItem } from './navigation-item-model';
import { debounceTime, Subscription } from 'rxjs';

@Component({
  selector: 'app-project-navigation-toolbox',
  imports: [CommonModule, FormsModule, Toolbox],
  templateUrl: './project-navigation-toolbox.html',
  styleUrl: './project-navigation-toolbox.scss'
})
export class ProjectNavigationToolbox implements OnInit, OnDestroy {

  @Input() project: Project | null = null;
  @Output() onProject = new EventEmitter<Project>();
  @Output() onCurrentChapter = new EventEmitter<CurrentChapter>();
  @Output() onCurrentArtifact = new EventEmitter<CurrentArtifact>();

  formSelectedCollectionOrBook = '';
  formSelectedArtifactOrChapter: number | null = null;
  formSelectedVerse: number | null = 1;
  navigationSearch = '';
  navigationOptionsVisible = false;
  activeNavigationIndex = -1;
  collections: FragmentCollection[] = [];
  current: CurrentChapter | CurrentArtifact | null = null;
  context: '' | 'transcriptor' | 'translator' = '';
  private subscriptions = new Subscription();
  private removeImmediateSaveHandler: (() => void) | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private collectionsStatefull: CollectionsStatefull,
    private router: Router,
    private systemService: SystemService,
    readonly toolboxVisibility: ToolboxVisibilityService
  ) { }

  ngOnInit(): void {
    this.removeImmediateSaveHandler = this.systemService.registerImmediateSaveHandler(
      () => this.saveProjectConfigImmediately(),
      true
    );
    this.subscriptions.add(SystemService
      .saveCurrentProject
      .asObservable()
      .pipe(debounceTime(SystemService.autoSaveDebounceTime))
      .subscribe({
        next: () => {
          if (this.project) {
            void this.systemService.saveProjectConfig(this.project).catch(error => {
              console.error('Unable to autosave project config:', error);
            });
          }
        }
      }));
    this.readProjectFromSession();
    if (this.project) {
      this.subscribeProjectCollections(this.project);
    }
    this.subscribeParams();
  }

  ngOnDestroy(): void {
    this.removeImmediateSaveHandler?.();
    this.subscriptions.unsubscribe();
  }

  private async saveProjectConfigImmediately(): Promise<void> {
    if (!this.project) {
      throw new Error('Cannot save because no project is loaded');
    }

    LoadingObservable.startLoading('save');
    try {
      await this.systemService.saveProjectConfig(this.project);
    } catch (error) {
      console.error('Unable to save project config:', error);
      alert('The project configuration could not be saved. Check the console for details.');
      throw error;
    } finally {
      await LoadingObservable.stopLoading();
    }
  }

  @HostListener('document:click', ['$event'])
  closeNavigationOptionsOutside(event: MouseEvent): void {
    const target = event.target;
    if (!(target instanceof Element) || !target.closest('.navigationPicker')) {
      this.navigationOptionsVisible = false;
      this.activeNavigationIndex = -1;
    }
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (this.context !== 'translator') {
      return;
    }

    let current: HTMLElement | null = null;
    for (const title of this.getVerseTitles()) {
      if (title.getBoundingClientRect().top <= 1) {
        current = title;
      } else {
        break;
      }
    }
    this.formSelectedVerse = current ? Number(current.dataset['verse']) : null;
  }

  scrollToVerse(verse: number): void {
    if (!Number.isInteger(verse) || verse < 1) {
      return;
    }

    const title = this.getVerseTitles().find(element => Number(element.dataset['verse']) === verse);
    if (title) {
      const top = title.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  private getVerseTitles(): HTMLElement[] {
    return Array.from(document.querySelectorAll<HTMLElement>('h2.verseTitle[data-verse]'));
  }

  private readProjectFromSession(): void {
    const project = getProjectFn();
    if (project) {
      this.project = project;
      this.onProject.emit(project);
    } else {
      const path = ['open'];
      console.log('[navigate]', path.join('/'));
      LoadingObservable.startLoading();
      this.router.navigate(path)
        .catch(error => console.error(error))
        .finally(() => LoadingObservable.stopLoading());
    }
  }

  private subscribeProjectCollections(project: Project): void {
    this.collections = this.collectionsStatefull.currentValue;
    this.subscriptions.add(this.collectionsStatefull.data$.subscribe({
      next: collections => this.collections = collections || []
    }));
    this.collectionsStatefull.update(project);
  }

  private subscribeParams(): void {
    this.subscriptions.add(this.activatedRoute.params.subscribe({
      next: params => {
        const book = params['book'];
        const chapter = Number(params['chapter']);
        const collection = params['collection'];
        const artifact = Number(params['artifact']);

        if (book && chapter) {
          const bookUpperCase = book.toUpperCase();
          this.formSelectedCollectionOrBook = `book-${bookUpperCase}`;
          this.formSelectedArtifactOrChapter = chapter;
          this.current = { book: bookUpperCase, chapter };
          this.onCurrentChapter.emit({ book: bookUpperCase, chapter });
          this.context = 'translator';
        } else if (collection && Number.isInteger(artifact) && artifact >= 0) {
          this.formSelectedCollectionOrBook = `collection-${collection}`;
          this.formSelectedArtifactOrChapter = artifact;
          this.current = { collection, artifact };
          this.onCurrentArtifact.emit({ collection, artifact });
          this.context = 'transcriptor';
        } else {
          this.context = '';
        }
      }
    }));
    this.subscriptions.add(this.activatedRoute.queryParams.subscribe({
      next: queryParams => {
        const verse = Number(queryParams['verse']);
        this.formSelectedVerse = Number.isInteger(verse) && verse > 0 ? verse : 1;
      }
    }));
  }

  get filteredBookNames(): Array<{ key: string; name: string }> {
    const books = this.project?.target.books || {};
    return Object.keys(books)
      .map(key => ({ key, name: books[key].name }))
      .filter(book => this.matchesNavigationSearch(book.name));
  }

  get filteredCollections(): FragmentCollection[] {
    return this.collections.filter(collection => this.matchesNavigationSearch(collection.name));
  }

  get selectedNavigationLabel(): string {
    const [type, ...keyParts] = this.formSelectedCollectionOrBook.split('-');
    const key = keyParts.join('-');

    if (type === 'book') {
      const books = this.project?.target.books || {};
      return books[key]?.name ?? '';
    }
    if (type === 'collection') {
      return this.collections.find(collection => collection.folder === key)?.name ?? '';
    }
    return '';
  }

  get filteredNavigationItems(): NavigationItem[] {
    const books: NavigationItem[] = this.filteredBookNames.map(book => ({
      value: `book-${book.key}`,
      label: book.name,
      group: 'book'
    }));
    const collections: NavigationItem[] = this.filteredCollections.map(collection => ({
      value: `collection-${collection.folder}`,
      label: collection.name,
      group: 'collection'
    }));
    return this.context === 'transcriptor'
      ? [...collections, ...books]
      : [...books, ...collections];
  }

  showNavigationOptions(): void {
    this.navigationOptionsVisible = true;
    this.activeNavigationIndex = -1;
  }

  onNavigationSearchChange(): void {
    this.activeNavigationIndex = -1;
    this.navigationOptionsVisible = true;
  }

  isActiveNavigationItem(value: string): boolean {
    return this.filteredNavigationItems[this.activeNavigationIndex]?.value === value;
  }

  selectNavigationItem(value: string): void {
    if (value !== this.formSelectedCollectionOrBook) {
      if (value.startsWith('collection-')) {
        this.formSelectedArtifactOrChapter = 0;
      } else if (this.formSelectedCollectionOrBook.startsWith('collection-')) {
        this.formSelectedArtifactOrChapter = 1;
      }
    }
    this.formSelectedCollectionOrBook = value;
    this.navigationSearch = '';
    this.navigationOptionsVisible = false;
    this.activeNavigationIndex = -1;
  }

  handleNavigationKeydown(event: KeyboardEvent): void {
    const options = this.filteredNavigationItems;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.navigationOptionsVisible = true;
      if (!options.length) {
        this.activeNavigationIndex = -1;
        return;
      }
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      this.activeNavigationIndex = (this.activeNavigationIndex + direction + options.length) % options.length;
    } else if (event.key === 'Enter' && this.navigationOptionsVisible) {
      event.preventDefault();
      const activeItem = options[this.activeNavigationIndex];
      if (activeItem) {
        this.selectNavigationItem(activeItem.value);
      }
    } else if (event.key === 'Escape') {
      this.navigationOptionsVisible = false;
      this.activeNavigationIndex = -1;
    }
  }

  async open(): Promise<void> {
    if (!this.formSelectedCollectionOrBook || this.formSelectedArtifactOrChapter === null) {
      return;
    }
    const [type, ...keyParts] = this.formSelectedCollectionOrBook.split('-');
    const key = keyParts.join('-');
    const chapterOrArtifact = String(this.formSelectedArtifactOrChapter);
    let path: string[] = [];
    let verseToScroll: number | null = null;

    if (type === 'book') {
      if (!Number.isInteger(this.formSelectedArtifactOrChapter) || this.formSelectedArtifactOrChapter < 1) {
        alert('Choose a valid chapter number.');
        return;
      }
      path = ['/translator/book', key, 'chapter', chapterOrArtifact];
      verseToScroll = this.formSelectedVerse !== null && Number.isInteger(this.formSelectedVerse) && this.formSelectedVerse > 0
        ? this.formSelectedVerse
        : null;
    } else if (type === 'collection') {
      const collection = this.collections.find(item => item.folder === key);
      if (!collection || !Number.isInteger(this.formSelectedArtifactOrChapter)
        || this.formSelectedArtifactOrChapter < 0 || this.formSelectedArtifactOrChapter >= collection.order.length) {
        alert('Choose an existing artifact in the collection.');
        return;
      }
      path = ['/transcriptor/collection', key, 'artifact', chapterOrArtifact];
    }
    if (!path.length) {
      return;
    }

    const targetPage = type === 'book'
      ? { book: key.toUpperCase(), chapter: Number(chapterOrArtifact) }
      : { collection: key, artifact: Number(chapterOrArtifact) };
    const isCurrentPage = type === 'book'
      ? this.current !== null
        && 'book' in this.current
        && this.current.book === targetPage.book
        && this.current.chapter === targetPage.chapter
      : this.current !== null
        && 'collection' in this.current
        && this.current.collection === targetPage.collection
        && this.current.artifact === targetPage.artifact;

    if (!isCurrentPage) {
      try {
        await this.systemService.saveCurrentPageImmediately();
      } catch (error) {
        console.error('Unable to save the current page before navigation:', error);
        return;
      }
    }

    LoadingObservable.startLoading();
    this.router.navigate(path, { queryParams: { verse: verseToScroll } })
      .then(navigated => {
        if (navigated && verseToScroll !== null) {
          this.scrollToVerseAfterNavigation(verseToScroll);
        }
      })
      .catch(error => console.error('Unable to navigate to selected page:', error))
      .finally(() => LoadingObservable.stopLoading());
  }

  back(): void {
    if (this.formSelectedArtifactOrChapter !== null) {
      const min = this.formSelectedCollectionOrBook.startsWith('collection-') ? 0 : 1;
      this.formSelectedArtifactOrChapter = Math.max(min, this.formSelectedArtifactOrChapter - 1);
      this.open();
    }
  }

  next(): void {
    if (this.formSelectedArtifactOrChapter !== null) {
      if (this.formSelectedCollectionOrBook.startsWith('collection-')) {
        const collection = this.collections.find(item => `collection-${item.folder}` === this.formSelectedCollectionOrBook);
        if (!collection || this.formSelectedArtifactOrChapter >= collection.order.length - 1) {
          return;
        }
      }
      this.formSelectedArtifactOrChapter++;
      this.open();
    }
  }

  private scrollToVerseAfterNavigation(verse: number): void {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      this.scrollToVerse(verse);
    }));
  }

  private matchesNavigationSearch(label: string): boolean {
    const query = this.normalizeNavigationSearch(this.navigationSearch);
    if (!query) {
      return true;
    }
    const candidate = this.normalizeNavigationSearch(label);
    let queryIndex = 0;
    for (const character of candidate) {
      if (character === query[queryIndex] && ++queryIndex === query.length) {
        return true;
      }
    }
    return false;
  }

  private normalizeNavigationSearch(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
  }
}
