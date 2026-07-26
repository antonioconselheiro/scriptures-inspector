import { Component, EventEmitter, HostBinding, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalService } from '@belomonte/async-modal-ngx';
import { CurrentArtifact } from '@domain/current-artifact-model';
import { CurrentChapter } from '@domain/current-chapter-model';
import { FragmentCollection } from '@domain/fragment-collection-model';
import { Project } from '@domain/project-model';
import { AddArtifactCollectionDialog } from '@shared/add-artifact-collection-dialog/add-artifact-collection-dialog';
import { EditArtifactsInCollectionDialog } from '@shared/edit-artifacts-in-collection-dialog/edit-artifacts-in-collection-dialog';
import { LoadingObservable } from '@shared/loading/loading-service';
import { getProjectFn } from '@shared/project/get-project-fn';
import { loadProjectCollectionsFn } from '@shared/project/load-project-collections-fn';
import { selectPngFilesFn } from '@shared/project/select-png-files-fn';
import { SystemService } from '@shared/system/system-service';
import { debounceTime, Subscription } from 'rxjs';

@Component({
  selector: 'app-project-header',
  imports: [
    FormsModule
  ],
  templateUrl: './project-header.html',
  styleUrl: './project-header.scss',
})
export class ProjectHeader implements OnInit, OnDestroy {

  @HostBinding('class.minimized')
  minimized = true;

  @Output() onProject = new EventEmitter<Project>();
  @Output() onCurrentChapter = new EventEmitter<CurrentChapter>();
  @Output() onCurrentArtifact = new EventEmitter<CurrentArtifact>(); 

  formSelectedCollectionOrBook = '';
  formSelectedArtifactOrChapter: number | null = null;
  
  project!: Project;
  collections: FragmentCollection[] = [];
  current: CurrentChapter | CurrentArtifact | null = null;

  private subscriptions = new Subscription();

  constructor(
    private activatedRoute: ActivatedRoute,
    private systemService: SystemService,
    private modalService: ModalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.readProjectFromSession();
    this.loadProjectCollections(this.project);
    this.subscribeParams();
    this.subscribeSaveProject();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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

  private loadProjectCollections(project: Project): void {
    loadProjectCollectionsFn(project)
      .then(collections => this.collections = collections)
      .catch(e => console.error(e));
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
        const book = params['book'].toUpperCase();
        const chapter = Number(params['chapter']);

        const collection = params['collection'];
        const artifact = Number(params['artifact']);

        if (book && chapter) {
          this.formSelectedCollectionOrBook = `book-${book}`;
          this.formSelectedArtifactOrChapter = chapter;
          this.current = { book, chapter };
          this.onCurrentChapter.next({ book, chapter });
        } else if (collection && artifact) {
          this.formSelectedCollectionOrBook = `collection-${collection}`;
          this.formSelectedArtifactOrChapter = artifact;
          this.current = { collection, artifact };
          this.onCurrentArtifact.next({ collection, artifact });
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

  open(): void {
    if (this.notNullLike(this.formSelectedCollectionOrBook) && this.notNullLike(this.formSelectedArtifactOrChapter)) {
      const [type, key] = this.formSelectedCollectionOrBook.split('-');
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
      }
  
      this.systemService.triggerSaveCurrentProject();
    }
  }

  addArtifactCollection(): void {
    if (this.project) {
      this.modalService
        .createModal(AddArtifactCollectionDialog)
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
}
