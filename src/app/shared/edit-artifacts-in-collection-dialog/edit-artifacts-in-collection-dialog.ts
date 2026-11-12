import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { FragmentCollection } from '@domain/fragment-collection-model';
import { Project } from '@domain/project-model';
import { ImagesPreview } from '@shared/images-preview/images-preview';
import { LoadingObservable } from '@shared/loading/loading-observable';
import { getArtifactCollectionFolderFn } from '@shared/project/get-artifact-collection-folder-fn';
import { importImagesFn } from '@shared/project/import-images-fn';
import { loadProjectCollectionsFn } from '@shared/project/load-project-collections-fn';
import { writeJsonFileFn } from '@shared/project/write-json-file-fn';
import { CollectionsStatefull } from '@shared/system/collections-statefull';
import { Subject } from 'rxjs';
import { FileNamePipe } from '../file-name/file-name-pipe';

@Component({
  selector: 'app-edit-artifacts-in-collection-dialog',
  imports: [
    ImagesPreview,
    DragDropModule,
    FileNamePipe
  ],
  templateUrl: './edit-artifacts-in-collection-dialog.html',
  styleUrl: './edit-artifacts-in-collection-dialog.scss',
})
export class EditArtifactsInCollectionDialog extends ModalableDirective<{
  title?: string;
  fromFiles?: Array<string>;
  collectionFolder?: string;
  project: Project;
}, void> {
  override response = new Subject<void>();

  fromFiles: Array<string> = [];
  project: Project | null = null;
  collections: Array<FragmentCollection> = [];
  collectionFolder?: string;
  selectedCollectionFiles: Array<string> = [];
  importing = false;

  @ViewChild(ImagesPreview)
  imagesPreview!: ImagesPreview;

  constructor(
    private cdr: ChangeDetectorRef,
    private collectionsStatefull: CollectionsStatefull
  ) {
    super();
  }

  override onInjectData(data: {
    title?: string;
    fromFiles?: Array<string>;
    collectionFolder?: string;
    project: Project;
  }): void {
    this.fromFiles = data.fromFiles || [];
    this.project = data.project;
    this.collectionFolder = data.collectionFolder;
    this.loadProjectCollections(data.project);
  }

  private loadProjectCollections(project: Project): void {
    loadProjectCollectionsFn(project)
      .then(collections => {
        this.collections = collections;
        this.collectionFolder = this.collectionFolder || collections[0]?.folder;
        this.onCollectionChoose(this.collectionFolder || '');
        this.cdr.detectChanges();
      })
      .catch(e => {
        console.error(e);
        alert('Unable to load artifact collections. Check the console for details.');
      });
  }

  viewFile(file: string): void {
    this.imagesPreview.imageIndex = this.selectedCollectionFiles.indexOf(file).toString();
  }

  onCollectionChoose(collectionFolder: string): void {
    this.collectionFolder = collectionFolder;
    const collection = this.collections.find(c => c.folder === collectionFolder);
    if (collection && this.project) {
      const folder = getArtifactCollectionFolderFn(this.project, collectionFolder);
      this.selectedCollectionFiles = [...(collection.order || []).map(file => `${folder}/${file}`), ...this.fromFiles];
    } else {
      this.selectedCollectionFiles = [...this.fromFiles];
    }
  }

  isImportingFile(fileFullPath: string): boolean {
    return this.fromFiles.includes(fileFullPath);
  }

  drop(event: CdkDragDrop<Array<string>>): void {
    moveItemInArray(
      this.selectedCollectionFiles,
      event.previousIndex,
      event.currentIndex
    );
  }

  saveCollectionMetadata(collectionFiles: Array<string>, collectionFolder: string): Promise<void> {
    const collection = this.collections.find(c => c.folder === collectionFolder);
    if (collection && this.project) {
      collection.order = collectionFiles.map(file => file.split(/[\\/]/).pop() || file);
      const { folder, ...metadata } = { ...collection };
      return writeJsonFileFn(`${getArtifactCollectionFolderFn(this.project, collectionFolder)}/metadata.json`, metadata);
    }
    
    return Promise.reject(new Error('No artifact collection selected'));
  }

  importArtifacts(collectionFolder: string): void {
    if (!this.collections.some(collection => collection.folder === collectionFolder)) {
      alert('Select an artifact collection before importing images.');
      return;
    }
    if (this.project && !this.importing) {
      this.importing = true;
      LoadingObservable.startLoading();
  
      const project = this.project;
      importImagesFn(this.fromFiles, getArtifactCollectionFolderFn(project, collectionFolder))
        .then(() => this.saveCollectionMetadata(this.selectedCollectionFiles, collectionFolder))
        .then(() => {
          this.collectionsStatefull.update(project);
          alert('Files imported successfully!');
          this.close();
        })
        .catch(e => {
          alert('An error occurred while importing the files.');
          console.error(e);
        })
        .finally(() => {
          this.importing = false;
          LoadingObservable.stopLoading();
          this.cdr.markForCheck();
        });
    }
  }

  saveMetadata(collectionFolder: string): void {
    LoadingObservable.startLoading();
    this.saveCollectionMetadata(this.selectedCollectionFiles, collectionFolder)
      .then(() => {
        alert('Changes saved!');
      })
      .catch(e => {
        alert('Error saving changes.');
        console.error(e);
      })
      .finally(() => {
        LoadingObservable.stopLoading();
        this.close();
      });
  }

  sortAZ(): void {
    if (confirm('Sorting the files will change the configured order; proceed?')) {
      this.selectedCollectionFiles = [...this.selectedCollectionFiles].sort((a, b) => a.localeCompare(b));
    }
  }

  sortZA(): void {
    if (confirm('Sorting the files will change the configured order; proceed?')) {
      this.selectedCollectionFiles = [...this.selectedCollectionFiles].sort((a, b) => b.localeCompare(a));
    }
  }
}
