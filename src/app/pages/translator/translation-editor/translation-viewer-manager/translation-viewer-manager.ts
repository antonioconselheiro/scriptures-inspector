import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AssociatedTranslation } from '@domain/associated-translation-model';
import { Codex } from '@domain/codex-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { Project } from '@domain/project-model';
import { RepositoryRecord } from '@domain/repository-record';
import { TargetMetadataDetail } from '@domain/target-metadata-detail-model';
import { getProjectTargetsMetadataDetailsFn } from '@shared/project/get-project-targets-metadata-details-fn';

@Component({
  selector: 'app-translation-viewer-manager',
  imports: [
    CommonModule
  ],
  templateUrl: './translation-viewer-manager.html',
  styleUrl: './translation-viewer-manager.scss',
})
export class TranslationViewerManager {

  @Input()
  codexMetadataRecord: {
    [source: string]: Codex<LanguageUnionType>
  } | null = null;

  @Input()
  project: Project | null = null;

  @Input()
  repositories: RepositoryRecord = {};
  
  @Output()
  addViewingTranslation = new EventEmitter<AssociatedTranslation>();

  getAssociableCodex(): Array<TargetMetadataDetail> {
    const codexMetadataRecord = this.codexMetadataRecord;
    if (!codexMetadataRecord || !this.project) {
      return [];
    }

    return getProjectTargetsMetadataDetailsFn(this.project.structures, this.project.target, codexMetadataRecord);
  }

  loadTranslation(associatedToEl: HTMLSelectElement, translationEl: HTMLSelectElement): void {
    if (!associatedToEl.value || !translationEl.value) {
      return;
    }

    this.addViewingTranslation.next({
      associatedTo: [associatedToEl.value],
      translation: translationEl.value
    });

    associatedToEl.value = '';
    translationEl.value = '';
  }
}
