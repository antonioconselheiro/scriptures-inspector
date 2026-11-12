import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsyncModalModule, ModalService } from '@belomonte/async-modal-ngx';
import { ArtifactFragment } from '@domain/artifact-fragment-model';
import { CurrentArtifact } from '@domain/current-artifact-model';
import { FragmentCollection } from '@domain/fragment-collection-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { Project } from '@domain/project-model';
import { languageMetadataRecord } from '@shared/language-metadata/language-metadata-record';
import { ProjectNavigationToolbox } from '@shared/project-navigation-toolbox/project-navigation-toolbox';
import { getArtifactCollectionFolderFn } from '@shared/project/get-artifact-collection-folder-fn';
import { localImageUrlFn } from '@shared/project/local-image-url-fn';
import { CollectionsStatefull } from '@shared/system/collections-statefull';
import { Subscription } from 'rxjs';
import { DefineTranscriptionDialog } from '../define-transcription-dialog/define-transcription-dialog';
import { DefineVectorDialog } from '../define-vector-dialog/define-vector-dialog';
import { Language } from '@domain/language-model';
import { LanguageAlternativeSpelling } from '@domain/language-alternative-spelling-model';
import { writeJsonFileFn } from '@shared/project/write-json-file-fn';
import { Router } from '@angular/router';

@Component({
  selector: 'app-transcription-editor-component',
  imports: [
    CommonModule,
    ProjectNavigationToolbox,
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
  metadataReady = false;
  imageFailed = false;

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
  private loadGeneration = 0;
  private metadataFilePath: string | null = null;

  constructor(
    private router: Router,
    private modalService: ModalService,
    private collectionsStatefull: CollectionsStatefull,
    private cdr: ChangeDetectorRef
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
      next: () => {
        const previousImage = this.getImage();
        this.updateCurrentCollectionDetails();
        if (this.getImage() !== previousImage) {
          this.loadArtifactData();
        }
        this.cdr.markForCheck();
      }
    }));
  }

  ngOnDestroy(): void {
    this.loadGeneration++;
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
    const generation = ++this.loadGeneration;
    const imageName = this.currentImageName;
    this.artifact = null;
    this.metadataFilePath = null;
    this.metadataReady = false;
    this.imageFailed = false;
    this.artifactForm.reset();
    if (!imageName || !this.folder) {
      return;
    }

    const basePath = `${this.folder}/${imageName.replace(/\.[^.]+$/, '')}.json`;
    const legacyPath = `${this.folder}/${imageName}.json`;
    void (async () => {
      try {
        let data = await window.api.readOptionalJsonFile<ArtifactFragment>(basePath);
        let metadataPath = basePath;
        if (!data && legacyPath !== basePath) {
          data = await window.api.readOptionalJsonFile<ArtifactFragment>(legacyPath);
          if (data) {
            metadataPath = legacyPath;
          }
        }
        if (generation !== this.loadGeneration) {
          return;
        }
        this.metadataFilePath = metadataPath;
        this.artifact = data;
        this.metadataReady = true;
        if (data) {
          this.artifactForm.patchValue({ language: data.language, spelling: data.spelling });
        }
        this.cdr.markForCheck();
      } catch (error) {
        if (generation === this.loadGeneration) {
          console.error('Unable to load artifact metadata:', error);
          alert('Unable to load artifact metadata. Check the console for details.');
        }
      }
    })();
  }

  saveArtifactData(): void {
    if (this.artifact && this.metadataFilePath) {
      writeJsonFileFn(this.metadataFilePath, this.artifact).then(() => {
        alert('Artifact data saved');
      }).catch(error => {
        alert('Error saving artifact data');
        console.error('Error saving artifact data:', error);
      });
    }
  }

  getImage(): string {
    const imageName = this.currentImageName;
    return imageName && this.folder ? localImageUrlFn(`${this.folder}/${imageName}`) : '';
  }

  onImageError(): void {
    this.imageFailed = true;
    console.error('Unable to load artifact image:', this.getImage());
  }

  private get currentImageName(): string | undefined {
    if (!this.current || !this.currentCollectionDetail || !Number.isInteger(this.current.artifact)
      || this.current.artifact < 0) {
      return undefined;
    }
    return this.currentCollectionDetail.order[this.current.artifact];
  }

  onArtifactSubmit(): void {
    if (!this.metadataReady) {
      return;
    }
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
      .setBindToRoute(this.router)
      .setData({
        title: 'Edit Transcription',
        transcription: artifact.transcription
      })
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
      .setBindToRoute(this.router)
      .setData({
        title: 'Define Vector',
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
