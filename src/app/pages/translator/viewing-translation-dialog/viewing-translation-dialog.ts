import { Component } from '@angular/core';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { AssociatedTranslation } from '@domain/associated-translation-model';
import { Codex } from '@domain/codex-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { Project } from '@domain/project-model';
import { RepositoryRecord } from '@domain/repository-record';
import { TranslationViewerManager } from '../translation-editor/translation-viewer-manager/translation-viewer-manager';
import { Subject } from 'rxjs';
import { ViewingTranslationDialogData } from './viewing-translation-dialog-data';

@Component({
  selector: 'app-viewing-translation-dialog',
  imports: [TranslationViewerManager],
  templateUrl: './viewing-translation-dialog.html',
  styleUrl: './viewing-translation-dialog.scss'
})
export class ViewingTranslationDialog extends ModalableDirective<ViewingTranslationDialogData, AssociatedTranslation> {

  project!: Project;
  codexMetadataRecord!: Record<string, Codex<LanguageUnionType>>;
  repositories: RepositoryRecord = {};

  override response = new Subject<AssociatedTranslation | void>();

  override onInjectData(data: ViewingTranslationDialogData): void {
    this.project = data.project;
    this.codexMetadataRecord = data.codexMetadataRecord;
    this.repositories = data.repositories;
  }

  onAssociate(association: AssociatedTranslation): void {
    this.response.next(association);
    this.close();
  }
}
