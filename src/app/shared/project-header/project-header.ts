import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostBinding, HostListener, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalService } from '@belomonte/async-modal-ngx';
import { CurrentArtifact } from '@domain/current-artifact-model';
import { CurrentChapter } from '@domain/current-chapter-model';
import { FragmentCollection } from '@domain/fragment-collection-model';
import { Project } from '@domain/project-model';
import { AddArtifactCollectionDialog } from '@shared/add-artifact-collection-dialog/add-artifact-collection-dialog';
import { EditArtifactsInCollectionDialog } from '@shared/edit-artifacts-in-collection-dialog/edit-artifacts-in-collection-dialog';
import { LoadingObservable } from '@shared/loading/loading-observable';
import { getProjectFn } from '@shared/project/get-project-fn';
import { selectPngFilesFn } from '@shared/project/select-png-files-fn';
import { CollectionsStatefull } from '@shared/system/collections-statefull';
import { SystemService } from '@shared/system/system-service';
import { debounceTime, Subscription } from 'rxjs';

type NavigationItem = {
  value: string;
  label: string;
  group: 'book' | 'collection';
};

@Component({
  selector: 'app-project-header',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './project-header.html',
  styleUrl: './project-header.scss',
})
export class ProjectHeader implements OnInit, OnDestroy {

  @HostBinding('class.minimized')
  minimized = true;

  saveIsAnimating = false;

  @Output() onProject = new EventEmitter<Project>();
  @Output() onCurrentChapter = new EventEmitter<CurrentChapter>();
  @Output() onCurrentArtifact = new EventEmitter<CurrentArtifact>();

  formSelectedCollectionOrBook = '';
  formSelectedArtifactOrChapter: number | null = null;
  navigationSearch = '';
  navigationOptionsVisible = false;
  activeNavigationIndex = -1;

  project!: Project;
  collections: FragmentCollection[] = [];
  current: CurrentChapter | CurrentArtifact | null = null;

  context: '' | 'transcriptor' | 'translator' = '';

  private subscriptions = new Subscription();

  constructor(
    private activatedRoute: ActivatedRoute,
    private systemService: SystemService,
    private collectionsStatefull: CollectionsStatefull,
    private modalService: ModalService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private elementRef: ElementRef<HTMLElement>
  ) { }

  ngOnInit(): void {
    this.readProjectFromSession();
    this.subscribeProjectCollections(this.project);
    this.subscribeParams();
    this.subscribeSaveProject();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  closeNavigationOptionsOutside(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.navigationOptionsVisible = false;
      this.activeNavigationIndex = -1;
    }
  }

  private readProjectFromSession(): void {
    const project = getProjectFn();
    if (project) {
      this.project = project;
      this.onProject.next(project);
    } else {
      const path = ['open'];
      console.log(`[navigate]`, path.join('/'));
      LoadingObservable.startLoading();
      this.router.navigate(path)
        .catch(e => console.error(e))
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

  private subscribeSaveProject(): void {
    this.subscriptions.add(SystemService
      .saveCurrentProject
      .asObservable()
      .pipe(debounceTime(SystemService.autoSaveDebounceTime))
      .subscribe({
        next: () => {
          this.systemService.saveProjectConfig(this.project);
        }
      }));
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
          this.onCurrentChapter.next({ book: bookUpperCase, chapter });
          this.context = 'translator';
        } else if (collection && artifact) {
          this.formSelectedCollectionOrBook = `collection-${collection}`;
          this.formSelectedArtifactOrChapter = artifact;
          this.current = { collection, artifact };
          this.onCurrentArtifact.next({ collection, artifact });
          this.context = 'transcriptor';
        } else {
          this.context = '';
        }
      }
    }));
  }

  private notNullLike<T>(value: T | null | undefined): value is T {
    if (value === undefined || value === null) {
      return false;
    } else {
      return true;
    }
  }

  zoomOut(): void {
    const fontScale = getComputedStyle(document.body)
      .getPropertyValue('--font-scale')
      .trim();
    document.body.style.setProperty('--font-scale', String(Number(fontScale) - 0.1));
  }

  resetZoom(): void {
    document.body.style.setProperty('--font-scale', '1');
  }

  zoomIn(): void {
    const fontScale = getComputedStyle(document.body)
      .getPropertyValue('--font-scale')
      .trim();
    document.body.style.setProperty('--font-scale', String(Number(fontScale) + 0.1));
  }

  open(): void {
    if (this.notNullLike(this.formSelectedCollectionOrBook) && this.notNullLike(this.formSelectedArtifactOrChapter)) {
      const [type, ...keyParts] = this.formSelectedCollectionOrBook.split('-');
      const key = keyParts.join('-');
      const chapterOrArtifact = String(this.formSelectedArtifactOrChapter);
      let path: string[] = [];

      if (type === 'book') {
        path = ['/translator/book', key, 'chapter', chapterOrArtifact];
      } else if (type === 'collection') {
        path = ['/transcriptor/collection', key, 'artifact', chapterOrArtifact];
      }

      console.log(`[navigate]`, path.join('/'));

      LoadingObservable.startLoading();
      this.router.navigate(path)
        .catch(e => console.error(e))
        .finally(() => LoadingObservable.stopLoading());
    }
  }

  back(): void {
    if (this.notNullLike(this.formSelectedArtifactOrChapter)) {
      const previous = Number(this.formSelectedArtifactOrChapter) - 1;
      if (previous < 0) {
        this.formSelectedArtifactOrChapter = 0;
      } else {
        this.formSelectedArtifactOrChapter = previous;
      }
      this.open();
    }
  }

  next(): void {
    if (this.notNullLike(this.formSelectedArtifactOrChapter)) {
      const next = Number(this.formSelectedArtifactOrChapter) + 1;
      this.formSelectedArtifactOrChapter = next;
      this.open();
    }
  }

  save(): void {
    this.saveIsAnimating = true;

    if (this.current) {
      if ('book' in this.current) {
        const book = this.current.book;
        this.systemService.triggerSaveCurrentBookMetadata({ book });
        this.systemService.triggerSaveCurrentBookInterlinear({ book });
        this.systemService.triggerSaveCurrentBookTranslations({ book });
      } else if ('collection' in this.current) {
        const collection = this.current.collection;
        const artifact = this.current.artifact;
        // TODO: this.systemService.triggerSaveCurrentArtifactMetadata({ collection, artifact });
        alert('ops, not implemented yet');
      }

      setTimeout(() => {
        this.saveIsAnimating = false;
        this.cdr.detectChanges();
      }, 12000);
      this.systemService.triggerSaveCurrentProject();
    }
  }

  addArtifactCollection(): void {
    if (this.project) {
      this.modalService
        .createModal(AddArtifactCollectionDialog)
        .setBindToRoute(this.router)
        .setOutletName('main')
        .setData({
          project: this.project
        })
        .build();
    }
  }

  addArtifacts(): void {
    selectPngFilesFn().then(fromFiles => {
      if (!fromFiles) {
        return;
      }

      this.modalService
        .createModal(EditArtifactsInCollectionDialog)
        .setBindToRoute(this.router)
        .setOutletName('main')
        .setData({
          fromFiles,
          project: this.project
        })
        .build();
    }).catch(e => console.error(e));
  }

  listBookNames(): Array<{ key: string, name: string }> {
    const books = this.project.target.books || {};
    return Object.keys(books).map(book => {
      return {
        key: book,
        name: books[book].name
      };
    });
  }

  get filteredBookNames(): Array<{ key: string, name: string }> {
    return this.listBookNames().filter(book => this.matchesNavigationSearch(book.name));
  }

  get filteredCollections(): FragmentCollection[] {
    return this.collections.filter(collection => this.matchesNavigationSearch(collection.name));
  }

  get selectedNavigationLabel(): string {
    const [type, ...keyParts] = this.formSelectedCollectionOrBook.split('-');
    const key = keyParts.join('-');

    if (type === 'book') {
      return this.listBookNames().find(book => book.key === key)?.name ?? '';
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

  private matchesNavigationSearch(label: string): boolean {
    const query = this.normalizeNavigationSearch(this.navigationSearch);
    if (!query) {
      return true;
    }

    const candidate = this.normalizeNavigationSearch(label);
    let queryIndex = 0;
    for (const character of candidate) {
      if (character === query[queryIndex]) {
        queryIndex++;
        if (queryIndex === query.length) {
          return true;
        }
      }
    }

    return false;
  }

  private normalizeNavigationSearch(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
  }
}
