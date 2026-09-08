import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { FragmentCollection } from '@domain/fragment-collection-model';
import { Project } from '@domain/project-model';
import { deleteDirectoryFn } from '@shared/project/delete-directory-fn';
import { writeJsonFileFn } from '@shared/project/write-json-file-fn';
import { CollectionsStatefull } from '@shared/system/collections-statefull';
import { Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-add-artifact-collection-dialog',
  imports: [
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

  private subscriptions = new Subscription();

  constructor(
    fb: FormBuilder,
    private collectionsStatefull: CollectionsStatefull,
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
    this.subscribeProjectCollections();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private subscribeProjectCollections(): void {
    this.collections = this.collectionsStatefull.currentValue;
    this.subscriptions.add(this.collectionsStatefull.data$.subscribe({
      next: collections => {
        this.collections = collections || [];
        this.cdr.detectChanges();
    }
    }));
  }

  deleteCollection(project: Project, folder: string): void {
    if (confirm('Tem certeza que deseja excluir esta coleção?\nA deleção da pasta e todos os arquivos internos será permanente.')) {
      deleteDirectoryFn(`${project.path}/artifacts/${folder}`)
        .then(success => {
          if (success) {
            this.collections = this.collections.filter(c => c.folder !== folder);
            this.collectionsStatefull.update(project);
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

    const project = this.project;
    if (project) {
      writeJsonFileFn(`${project.path}/artifacts/${this.derivateFolderName(collectionName)}/metadata.json`, {
        name: collectionName,
        description: collectionDescription || '',
        order: []
      })
        .then(() => this.collectionsStatefull.update(project))
        .catch(e => console.error(e));
    }
  }
}
