import { ChangeDetectorRef, Component } from '@angular/core';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { FragmentCollection } from '@domain/fragment-collection-model';
import { Project } from '@domain/project-model';
import { ImagesPreview } from '@shared/images-preview/images-preview';
import { LoadingObservable } from '@shared/loading/loading-service';
import { importImagesFn } from '@shared/project/import-images-fn';
import { loadProjectCollectionsFn } from '@shared/project/load-project-collections-fn';
import { Subject } from 'rxjs';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { FileNamePipe } from './file-name-pipe';

@Component({
  selector: 'app-add-artifact-dialog',
  imports: [
    ImagesPreview,
    DragDropModule,
    FileNamePipe
  ],
  templateUrl: './add-artifact-dialog.html',
  styleUrl: './add-artifact-dialog.scss',
})
export class AddArtifactDialog extends ModalableDirective<{
  fromFiles: Array<string>;
  project: Project;
}, void> {
  override response = new Subject<void>();

  fromFiles: Array<string> = [];
  project: Project | null = null;
  collections: Array<FragmentCollection> = [];

  constructor(
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  override onInjectData(data: {
    fromFiles: Array<string>;
    project: Project;
  }): void {
    this.fromFiles = data.fromFiles;
    this.project = data.project;
    this.loadProjectCollections(data.project);
  }

  private loadProjectCollections(project: Project): void {
    loadProjectCollectionsFn(project)
      .then(collections => {
        this.collections = collections;
        this.cdr.detectChanges();
      })
      .catch(e => console.error(e));
  }

  drop(event: CdkDragDrop<Array<string>>): void {
    moveItemInArray(
      this.fromFiles,
      event.previousIndex,
      event.currentIndex
    );
  }

  importArtifacts(collectionFolder: string): void {
    LoadingObservable.startLoading();
    importImagesFn(this.fromFiles, collectionFolder)
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
}
