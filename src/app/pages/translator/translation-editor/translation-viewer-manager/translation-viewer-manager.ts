import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AssociatedTranslation } from '@domain/associated-translation-model';
import { Codex } from '@domain/codex-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { RepositoryRecord } from '@domain/repository-record';
import { languageMetadataRecord } from '@shared/language-metadata/language-metadata-record';

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

  getAssociableCodex(): Array<{ value: string, label: string }> {
    if (!this.codexMetadataRecord) {
      return [];
    }

    return Object.keys(this.codexMetadataRecord).map(source => {
      const codex = this.codexMetadataRecord![source];
      return {
        value: source,
        label: `${codex.name} (${codex.language})`
      };
    });
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
