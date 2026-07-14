import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component } from '@angular/core';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { FragmentCollection } from '@domain/fragment-collection-model';
import { Project } from '@domain/project-model';
import { ImagesPreview } from '@shared/images-preview/images-preview';
import { LoadingObservable } from '@shared/loading/loading-service';
import { importImagesFn } from '@shared/project/import-images-fn';
import { loadProjectCollectionsFn } from '@shared/project/load-project-collections-fn';
import { writeJsonFileFn } from '@shared/project/write-json-file-fn';
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

  constructor(
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  override onInjectData(data: {
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
        this.onCollectionChoose(collections[0]?.folder || '');
        this.cdr.detectChanges();
      })
      .catch(e => console.error(e));
  }

  onCollectionChoose(collectionFolder: string): void {
    const collection = this.collections.find(c => c.folder === collectionFolder);
    if (collection && collection.order) {
      this.selectedCollectionFiles = [...collection.order, ...this.fromFiles];
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
      collection.order = [...collectionFiles];
      const { folder, ...metadata } = { ...collection };
      return writeJsonFileFn(`${this.project.path}/artifacts/${folder}/metadata.json`, metadata);
    }
    
    return Promise.resolve();
  }

  importArtifacts(collectionFolder: string): void {
    LoadingObservable.startLoading();

    Promise.all([
      this.saveCollectionMetadata(this.selectedCollectionFiles, collectionFolder),
      importImagesFn(this.selectedCollectionFiles, collectionFolder)
    ])
      .then(() => {
        alert('Arquivos importados com sucesso!');
      })
      .catch(e => {
        alert('Ocorreu um erro ao importar os arquivos.');
        console.error(e);
      })
      .finally(() => {
        LoadingObservable.stopLoading();
        this.close();
      });
  }

  saveMetadata(collectionFolder: string): void {
    LoadingObservable.startLoading();
    this.saveCollectionMetadata(this.selectedCollectionFiles, collectionFolder)
      .then(() => {
        alert('Alterações salvas com sucesso!');
      })
      .catch(e => {
        alert('Ocorreu um erro ao salvar as alterações.');
        console.error(e);
      })
      .finally(() => {
        LoadingObservable.stopLoading();
        this.close();
      });
  }

  sortAZ(): void {
    if (confirm('Ordenar os arquivos em ordem alfabética irá alterar a ordem configurada, prosseguir?')) {
      this.selectedCollectionFiles = [...this.selectedCollectionFiles].sort((a, b) => a.localeCompare(b));
    }
  }

  sortZA(): void {
    if (confirm('Ordenar os arquivos em ordem decrescente irá alterar a ordem configurada, prosseguir?')) {
      this.selectedCollectionFiles = [...this.selectedCollectionFiles].sort((a, b) => b.localeCompare(a));
    }
  }
}
