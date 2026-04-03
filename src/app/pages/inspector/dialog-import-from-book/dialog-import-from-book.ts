import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { ProjectData } from '@domain/project-data-model';
import { Project } from '@domain/project-model';
import { TargetMetadataDetail } from '@domain/target-metadata-detail-model';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-dialog-import-from-book',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './dialog-import-from-book.html',
  styleUrl: './dialog-import-from-book.scss',
})
export class DialogImportFromBook extends ModalableDirective<{
  targetMetadataDetails: TargetMetadataDetail[],
  project: Project,
  projectData: ProjectData,
  book: string
}, void> {

  book!: string;
  project!: Project;
  projectData!: ProjectData;
  targetMetadataDetails!: TargetMetadataDetail[];

  form!: FormGroup<any>;

  override response = new Subject<void>();

  constructor(
    fb: FormBuilder
  ) {
    super();
    this.form = fb.group({
      selectedBook: ['', [Validators.required]],
      override: [false]
    });
  }

  override onInjectData(data: {
    targetMetadataDetails: TargetMetadataDetail[],
    project: Project,
    projectData: ProjectData,
    book: string
  }): void {
    this.book = data.book;
    this.project = data.project;
    this.projectData = data.projectData;
    this.targetMetadataDetails = data.targetMetadataDetails;
  }

  listBookNames(): Array<{ key: string, name: string }> {
    return Object.keys(this.project.target.books).map(book => {
      return {
        key: book,
        name: this.project.target.books[book].name
      };
    });
  }

  onImportFromBookSubmit(): void {
    if (this.form.valid) {
      const { selectedBook, override } = this.form.value;

      if (confirm(`Are you sure you want to import ${override ? 'and override' : ''} patterns and lexicals from "${selectedBook}"?`)) {
        this.project.target.books[this.book]
        this.projectData
      }

      this.form.reset();
    } else {
      this.form.markAllAsTouched();
    }
  }
}
