import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AsyncModalModule, ModalService } from '@belomonte/async-modal-ngx';
import { CurrentArtifact } from '@domain/current-artifact-model';
import { FragmentCollection } from '@domain/fragment-collection-model';
import { Project } from '@domain/project-model';
import { ProjectHeader } from '@shared/project-header/project-header';
import { getArtifactCollectionFolderFn } from '@shared/project/get-artifact-collection-folder-fn';
import { CollectionsStatefull } from '@shared/system/collections-statefull';
import { Subscription } from 'rxjs';
import { DefineTranscriptionDialog } from '../define-transcription-dialog/define-transcription-dialog';
import { DefineVectorDialog } from '../define-vector-dialog/define-vector-dialog';

@Component({
  selector: 'app-transcription-editor-component',
  imports: [
    CommonModule,
    ProjectHeader,
    AsyncModalModule,
    DefineVectorDialog,
    DefineTranscriptionDialog
  ],
  templateUrl: './transcription-editor-component.html',
  styleUrl: './transcription-editor-component.scss'
})
export class TranscriptionEditorComponent implements OnInit, OnDestroy {

  project: Project | null = null;
  current: CurrentArtifact | null = null;
  folder = '';
  currentCollectionDetail: FragmentCollection | null = null;

  private subscriptions = new Subscription();

  constructor(
    private modalService: ModalService,
    private collectionsStatefull: CollectionsStatefull
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.collectionsStatefull.data$.subscribe({
      next: () => this.updateCurrentCollectionDetails()
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onProjectChange(project: Project | null): void {
    this.project = project;
    this.updateArtifactFolder();
  }

  onCurrentArtifactChange(current: CurrentArtifact | null): void {
    this.current = current;
    this.updateArtifactFolder();
    this.updateCurrentCollectionDetails();
  }

  updateCurrentCollectionDetails(): void {
    const current = this.current;
    if (current) {
      this.currentCollectionDetail = this.collectionsStatefull.currentValue.find(collection => collection.folder === current.collection) || null;
    } else {
      this.currentCollectionDetail = null;
    }
  }

  updateArtifactFolder(): void {
    if (this.project && this.current) {
      this.folder = getArtifactCollectionFolderFn(this.project, this.current.collection);
    } else {
      this.folder = '';
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

  openDialogIncludeTranscription(): void {
    this.modalService
      .createModal(DefineTranscriptionDialog)
      .setOutletName('main')
      .build();
  }

  openDialogDefineVector(): void {
    this.modalService
      .createModal(DefineVectorDialog)
      .setOutletName('main')
      .build();
  }
}
