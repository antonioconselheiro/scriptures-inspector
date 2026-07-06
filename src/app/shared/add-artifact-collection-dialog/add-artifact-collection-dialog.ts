import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { FragmentCollection } from '@domain/fragment-collection-model';
import { Project } from '@domain/project-model';
import { deleteDirectoryFn } from '@shared/project/delete-directory-fn';
import { loadProjectCollectionsFn } from '@shared/project/load-project-collections-fn';
import { writeJsonFileFn } from '@shared/project/write-json-file-fn';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-add-artifact-collection-dialog',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './add-artifact-collection-dialog.html',
  styleUrl: './add-artifact-collection-dialog.scss',
})
export class AddArtifactCollectionDialog extends ModalableDirective<{
  project: Project;
}, void> {

  override response = new Subject<void>();

  form: FormGroup<any>;
  project: Project | null = null;
  collections: Array<FragmentCollection> = [];

  constructor(
    fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    super();
    this.form = fb.group({
      variant: ['', [Validators.required]]
    });
  }

  override onInjectData(data: {
    project: Project;
  }): void {
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

  deleteCollection(project: Project, folder: string): void {
    if (confirm('Tem certeza que deseja excluir esta coleção?\nA deleção da pasta e todos os arquivos internos será permanente.')) {
      deleteDirectoryFn(`${project.path}/fragments/${folder}`)
        .then(success => {
          if (success) {
            this.collections = this.collections.filter(c => c.folder !== folder);
            this.cdr.detectChanges();
          } else {
            console.error(`Failed to delete directory: ${folder}`);
          }
        })
        .catch(e => console.error(e));
    }
  }

  derivateFolderName(name: string): string {
    return name
      .normalize("NFD")
      .toLowerCase()
      .replace(/[áàâãäå]/gi, "a")
      .replace(/[éèêëə]/gi, "e")
      .replace(/[íìîï]/gi, "i")
      .replace(/[óòôõö]/gi, "o")
      .replace(/[úùûü]/gi, "u")
      .replace(/[ç]/gi, "c")
      .replace(/[ñ]/gi, "n")
      .replace(/[\u0300-\u036f]/g, '-') // remove acentos
      .replace(/[^a-z0-9\s_-]/g, '')    // mantém apenas ASCII
      .replace(/[\s_-]+/g, '-')         // espaços e '_' -> '-'
      .replace(/^-+|-+$/g, '');         // remove '-' do início/fim
  }

  createCollection(
    collectionNameEl: HTMLInputElement,
    collectionDescriptionEl: HTMLTextAreaElement
  ): void {
    if (!collectionNameEl.value) {
      return;
    }

    const collectionName = collectionNameEl.value;
    const collectionDescription = collectionDescriptionEl.value;

    collectionNameEl.value = '';
    collectionDescriptionEl.value = '';

    if (this.project) {
      writeJsonFileFn(`${this.project.path}/fragments/${this.derivateFolderName(collectionName)}/metadata.json`, {
        name: collectionName,
        description: collectionDescription
      }).catch(e => console.error(e));
    }
  }
}
