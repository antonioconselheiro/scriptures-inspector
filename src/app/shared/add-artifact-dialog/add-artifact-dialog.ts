import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { FragmentCollection } from '@domain/fragment-collection-model';
import { Project } from '@domain/project-model';
import { ImagesPreview } from '@shared/images-preview/images-preview';
import { loadProjectCollectionsFn } from '@shared/project/load-project-collections-fn';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-add-artifact-dialog',
  imports: [
    ImagesPreview
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
    fb: FormBuilder,
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
}
