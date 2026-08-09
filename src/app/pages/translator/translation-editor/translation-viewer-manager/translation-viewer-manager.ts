import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AssociatedTranslation } from '@domain/associated-translation-model';
import { Codex } from '@domain/codex-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { Project } from '@domain/project-model';
import { RepositoryRecord } from '@domain/repository-record';
import { TargetMetadataDetail } from '@domain/target-metadata-detail-model';
import { languageMetadataRecord } from '@shared/language-metadata/language-metadata-record';
import { getProjectTargetsMetadataDetailsFn } from '@shared/project/get-project-targets-metadata-details-fn';

@Component({
  selector: 'app-translation-viewer-manager',
  imports: [
    CommonModule
  ],
  templateUrl: './translation-viewer-manager.html',
  styleUrl: './translation-viewer-manager.scss',
})
export class TranslationViewerManager implements OnInit {

  @Input()
  codexMetadataRecord: {
    [source: string]: Codex<LanguageUnionType>
  } | null = null;

  @Input()
  project: Project | null = null;
  
  @Output()
  addViewingTranslation = new EventEmitter<AssociatedTranslation>();

  repositories: RepositoryRecord = {};
  readonly languageMetadataRecord = languageMetadataRecord;

  constructor(
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.subscribeData();
  }

  private subscribeData(): void {
    this.activatedRoute.data.subscribe({
      next: data => {
        const repositories = this.repositories = data['repositories'];

        Object.keys(repositories).forEach(repository => {
          const languageMetadataRecord: any = this.languageMetadataRecord;
          if (!languageMetadataRecord[repository]) {
            languageMetadataRecord[repository] = {
              name: repositories[repository].name,
              label: repositories[repository].key
            };
          }
        });
      }
    });
  }

  getAssociableCodex(): Array<TargetMetadataDetail> {
    const codexMetadataRecord = this.codexMetadataRecord;
    if (!codexMetadataRecord || !this.project) {
      return [];
    }

    return getProjectTargetsMetadataDetailsFn(this.project, codexMetadataRecord);
  }

  loadTranslation(associatedToEl: HTMLSelectElement, translationEl: HTMLSelectElement): void {
    this.addViewingTranslation.next({
      associatedTo: [associatedToEl.value],
      translation: translationEl.value
    });

    associatedToEl.value = '';
    translationEl.value = '';
  }
}
