import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AsyncModalModule } from '@belomonte/async-modal-ngx';
import { CurrentArtifact } from '@domain/current-artifact-model';
import { Project } from '@domain/project-model';
import { ProjectHeader } from '@shared/project-header/project-header';

@Component({
  selector: 'app-transcription-editor-component',
  imports: [
    ProjectHeader,
    AsyncModalModule,
    CommonModule
  ],
  templateUrl: './transcription-editor-component.html',
  styleUrl: './transcription-editor-component.scss',
})
export class TranscriptionEditorComponent {
  project: Project | null = null;
  current: CurrentArtifact | null = null;

  onProjectChange(project: Project): void {
    this.project = project;
  }

  onCurrentArtifactChange(current: CurrentArtifact): void {
    this.current = current;
  }
}
