import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { FragmentCollection } from '@domain/fragment-collection-model';
import { Project } from '@domain/project-model';
import { listDirectoriesFn } from '@shared/project/list-directories-fn';
import { readJsonFileFn } from '@shared/project/read-file-json-fn';
import { writeJsonFileFn } from '@shared/project/write-json-file-fn';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-add-fragment-dialog',
  imports: [
    FormsModule
  ],
  templateUrl: './add-fragment-dialog.html',
  styleUrl: './add-fragment-dialog.scss',
})
export class AddFragmentDialog extends ModalableDirective<{
  fromFiles: Array<string>;
  project: Project;
}, void> {

  override response = new Subject<void>();

  form: FormGroup<any>;
  fromFiles: Array<string> = [];
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
    fromFiles: Array<string>;
    project: Project;
  }): void {
    this.fromFiles = data.fromFiles;
    this.project = data.project;
    this.loadProjectCollections(data.project);
  }

  private loadProjectCollections(project: Project): void {
    listDirectoriesFn(`${project.path}/fragments`)
      .then(directories => {
        directories.forEach(directory => {
          readJsonFileFn<FragmentCollection>(`${project.path}/fragments/${directory}/metadata.json`)
            .then(metadata => {
              if (metadata) {
                metadata.folder = directory;
                this.collections.push(metadata);
                this.cdr.detectChanges();
              }
            }).catch(e => console.error(e));
        });
      })
      .catch(e => console.error(e));
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
