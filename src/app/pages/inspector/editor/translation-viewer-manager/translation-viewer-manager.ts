import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

  @Output()
  addViewingTranslation = new EventEmitter<string>();

  repositories!: RepositoryRecord;
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

  loadTranslation(viewingTranslation: string): void {
    this.addViewingTranslation.next(viewingTranslation);
  }
}
