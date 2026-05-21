import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { BookMetadataAttributes } from '@domain/book-metadata-attributes-model';
import { Book } from '@domain/book-model';
import { BookTranslationTarget } from '@domain/book-translation-target-model';
import { ProjectData } from '@domain/project-data-model';
import { Project } from '@domain/project-model';
import { TargetMetadataDetail } from '@domain/target-metadata-detail-model';
import { targetsLoaderFn } from '@shared/project/targets-loader-fn';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-import-from-book-dialog',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './import-from-book-dialog.html',
  styleUrl: './import-from-book-dialog.scss',
})
export class ImportFromBookDialog extends ModalableDirective<{
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
      override: [false],
      variations: [true]
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
      const { selectedBook, override, variations } = this.form.value;

      if (confirm(`Are you sure you want to import ${override ? 'and override ' : ''}patterns and lexicals from "${selectedBook}"?`)) {
        targetsLoaderFn(selectedBook).then(projectData => {
          this.joinProjectData(projectData, variations, override);
          alert('Patterns and lexicals imported successfully');
        }).catch(e => {
          alert('Not possible to load book to import');
          console.error(e);
        });
      }

      this.form.reset();
    } else {
      this.form.markAllAsTouched();
    }
  }

  private joinProjectData(projectData: ProjectData, variations: boolean, override: boolean): void {
    console.info('projectData:', projectData);
    console.info('this.projectData:', this.projectData);
    Object.keys(projectData).forEach(target => {
      const importFromBook = projectData[target];
      const toBook = this.projectData[target];
      if (this.hasConfigs(toBook) && this.hasConfigs(importFromBook)) {
        this.importConfigs(toBook, importFromBook, override);
      }

      console.info('target:', target);
      if (variations && this.isTranslation(toBook, target) && this.hasVariations(importFromBook)) {

        Object.keys(importFromBook.variations).forEach(variationId => {
          toBook.variations[variationId] = { ...importFromBook.variations[variationId] };
        });
      }
    });
  }

  private isTranslation(toBook: Book<object, object>, target: string): toBook is BookTranslationTarget {
    return /\-translation$/.test(target);
  }

  private hasVariations(importFromBook: Book<object, object>): importFromBook is BookTranslationTarget {
    return 'variations' in importFromBook;
  }

  private hasConfigs(book: Book<object, object>): book is Book<BookMetadataAttributes> {
    return 'lexical' in book && 'patterns' in book;
  }

  private importConfigs(toBook: Book<BookMetadataAttributes>, importFromBook: Book<BookMetadataAttributes>, override: boolean) {
    Object.keys(importFromBook.lexical).forEach(key => {
      if (importFromBook.lexical[key] && (override || !override && !toBook.lexical[key])) {
        toBook.lexical[key] = importFromBook.lexical[key];
      }
    });

    toBook.patterns.lexeme = [ ...new Set([ ...toBook.patterns.lexeme, ...importFromBook.patterns.lexeme ]) ];
    toBook.patterns.prefix = [ ...new Set([ ...toBook.patterns.prefix, ...importFromBook.patterns.prefix ]) ];
    toBook.patterns.suffix = [ ...new Set([ ...toBook.patterns.suffix, ...importFromBook.patterns.suffix ]) ];
  }
}
