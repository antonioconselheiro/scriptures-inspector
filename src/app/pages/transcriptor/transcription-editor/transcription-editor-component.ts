import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsyncModalModule, ModalService } from '@belomonte/async-modal-ngx';
import { ArtifactFragment } from '@domain/artifact-fragment-model';
import { CurrentArtifact } from '@domain/current-artifact-model';
import { FragmentCollection } from '@domain/fragment-collection-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { Project } from '@domain/project-model';
import { languageMetadataRecord } from '@shared/language-metadata/language-metadata-record';
import { ProjectHeader } from '@shared/project-header/project-header';
import { getArtifactCollectionFolderFn } from '@shared/project/get-artifact-collection-folder-fn';
import { readJsonFileFn } from '@shared/project/read-file-json-fn';
import { CollectionsStatefull } from '@shared/system/collections-statefull';
import { Subscription } from 'rxjs';
import { DefineTranscriptionDialog } from '../define-transcription-dialog/define-transcription-dialog';
import { DefineVectorDialog } from '../define-vector-dialog/define-vector-dialog';
import { Language } from '@domain/language-model';
import { LanguageAlternativeSpelling } from '@domain/language-alternative-spelling-model';
import { writeJsonFileFn } from '@shared/project/write-json-file-fn';

@Component({
  selector: 'app-transcription-editor-component',
  imports: [
    CommonModule,
    ProjectHeader,
    ReactiveFormsModule,
    AsyncModalModule
  ],
  templateUrl: './transcription-editor-component.html',
  styleUrl: './transcription-editor-component.scss'
})
export class TranscriptionEditorComponent implements OnInit, OnDestroy {

  project: Project | null = null;
  current: CurrentArtifact | null = null;
  artifact: ArtifactFragment | null = null;

  showImage = true;
  showVector = true;
  showTranscriptionPositioning = true;

  folder = '';
  currentCollectionDetail: FragmentCollection | null = null;

  readonly languageMetadata = languageMetadataRecord;

  readonly languageOptions = Object.entries(languageMetadataRecord).map(
    ([value, language]) => ({
      value,
      name: language.name
    })
  );

  readonly artifactForm = new FormGroup({
    language: new FormControl<LanguageUnionType | null>(
      null,
      Validators.required
    ),
    spelling: new FormControl<string | null>(null)
  });

  private subscriptions = new Subscription();

  constructor(
    private modalService: ModalService,
    private collectionsStatefull: CollectionsStatefull
  ) {
    this.subscriptions.add(this
      .artifactForm
      .controls
      .language
      .valueChanges
      .subscribe(() => this.artifactForm.controls.spelling.setValue(null)));
  }

  ngOnInit(): void {
    this.subscriptions.add(this.collectionsStatefull.data$.subscribe({
      next: () => this.updateCurrentCollectionDetails()
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get selectedLanguage(): Language | undefined {
    const language = this.artifactForm.controls.language.value;

    return language
      ? languageMetadataRecord[language]
      : undefined;
  }

  get spellingOptions(): Array<LanguageAlternativeSpelling> | undefined {
    return this.selectedLanguage?.alternativeSpelling ?? [];
  }

  get hasSpellingOptions(): boolean {
    return this.spellingOptions && this.spellingOptions.length > 0 || false;
  }

  onProjectChange(project: Project | null): void {
    this.project = project;
    this.defineArtifactFolder();
  }

  onCurrentArtifactChange(current: CurrentArtifact | null): void {
    this.current = current;
    this.defineArtifactFolder();
    this.updateCurrentCollectionDetails();
    this.loadArtifactData();
  }

  updateCurrentCollectionDetails(): void {
    const current = this.current;
    if (current) {
      this.currentCollectionDetail = this.collectionsStatefull.currentValue.find(collection => collection.folder === current.collection) || null;
    } else {
      this.currentCollectionDetail = null;
    }
  }

  defineArtifactFolder(): void {
    if (this.project && this.current) {
      this.folder = getArtifactCollectionFolderFn(this.project, this.current.collection);
    } else {
      this.folder = '';
    }
  }

  loadArtifactData(): void {
    const currentCollectionDetail = this.currentCollectionDetail;
    const current = this.current;

    if (currentCollectionDetail && current) {
      const fileName = `${this.folder}/${currentCollectionDetail.order[current.artifact]}.json`;
      readJsonFileFn<ArtifactFragment | null>(fileName)
        .then(data => {
          if (data) {
            this.artifact = data;
          }
        });
    }
  }

  saveArtifactData(): void {
    if (this.artifact && this.currentCollectionDetail && this.current) {
      const fileName = `${this.folder}/${this.currentCollectionDetail.order[this.current.artifact]}.json`;
      writeJsonFileFn(fileName, this.artifact).then(() => {
        alert('Artifact data saved');
      }).catch(error => {
        alert('Error saving artifact data');
        console.error('Error saving artifact data:', error);
      });
    }
  }

  getImage(): string {
    const currentCollectionDetail = this.currentCollectionDetail;
    const current = this.current;

    if (currentCollectionDetail && current) {
      return 'local://' + encodeURIComponent(`${this.folder}/${currentCollectionDetail.order[current.artifact] || ''}`);
    } else {
      return '';
    }
  }

  onArtifactSubmit(): void {
    if (this.artifactForm.invalid) {
      this.artifactForm.markAllAsTouched();
      return;
    }

    const { language, spelling } = this.artifactForm.getRawValue();

    if (!language) {
      return;
    }

    if (this.artifact === null) {
      this.artifact = {
        vector: '',
        transcription: '',
        language,
        spelling: spelling ?? '',
        positions: [],
        bookSchema: []
      };

      return;
    }

    this.artifact.language = language;
    this.artifact.spelling = spelling ?? '';
  }

  openDialogIncludeTranscription(artifact: ArtifactFragment): void {
    this.modalService
      .createModal(DefineTranscriptionDialog)
      .setOutletName('main')
      .build()
      .subscribe({
        next: (result) => {
          if (result) {
            artifact.transcription = result.transcription;
          }
        }
      });
  }

  openDialogDefineVector(artifact: ArtifactFragment): void {
    this.modalService
      .createModal(DefineVectorDialog)
      .setData({
        fragmentImage: this.getImage()
      })
      .setOutletName('main')
      .build()
      .subscribe({
        next: (result) => {
          if (result) {
            artifact.vector = result.vector;
          }
        }
      });
  }
}
