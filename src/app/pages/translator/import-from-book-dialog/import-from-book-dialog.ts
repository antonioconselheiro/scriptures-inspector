import { Component, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { BookMetadataAttributes } from '@domain/book-metadata-attributes-model';
import { Book } from '@domain/book-model';
import { BookTranslationTarget } from '@domain/book-translation-target-model';
import { KeyMetadata } from '@domain/key-metadata-type';
import { KeyTranslation } from '@domain/key-translation-type';
import { ProjectData } from '@domain/project-data-model';
import { Project } from '@domain/project-model';
import { TargetMetadataDetail } from '@domain/target-metadata-detail-model';
import { targetsLoaderFn } from '@shared/project/targets-loader-fn';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-import-from-book-dialog',
  imports: [
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './import-from-book-dialog.html',
  styleUrl: './import-from-book-dialog.scss',
})
export class ImportFromBookDialog extends ModalableDirective<{
  title: string,
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
  bookSearch = '';
  bookOptionsVisible = false;
  activeBookIndex = -1;

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
    title: string,
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
    const books = this.project.target.books || {};
    return Object.keys(books).map(book => {
      return {
        key: book,
        name: books[book].name
      };
    });
  }

  get filteredBookNames(): Array<{ key: string, name: string }> {
    const query = this.normalizeBookSearch(this.bookSearch);
    return this.listBookNames().filter(book => {
      if (!query) {
        return true;
      }

      const candidate = this.normalizeBookSearch(book.name);
      let queryIndex = 0;
      for (const character of candidate) {
        if (character === query[queryIndex] && ++queryIndex === query.length) {
          return true;
        }
      }
      return false;
    });
  }

  get selectedBookName(): string {
    const selectedBook = this.form.get('selectedBook')?.value;
    return this.listBookNames().find(book => book.key === selectedBook)?.name ?? '';
  }

  @HostListener('document:click', ['$event'])
  closeBookOptionsOutside(event: MouseEvent): void {
    const target = event.target;
    if (!(target instanceof Element) || !target.closest('.bookPicker')) {
      this.bookOptionsVisible = false;
      this.activeBookIndex = -1;
    }
  }

  showBookOptions(): void {
    this.bookOptionsVisible = true;
    this.activeBookIndex = -1;
  }

  onBookSearchChange(): void {
    this.activeBookIndex = -1;
    this.bookOptionsVisible = true;
    if (this.bookSearch) {
      this.form.get('selectedBook')?.setValue('');
    }
  }

  selectBook(key: string): void {
    this.form.get('selectedBook')?.setValue(key);
    this.form.get('selectedBook')?.markAsTouched();
    this.bookSearch = '';
    this.bookOptionsVisible = false;
    this.activeBookIndex = -1;
  }

  handleBookKeydown(event: KeyboardEvent): void {
    const options = this.filteredBookNames;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.bookOptionsVisible = true;
      if (!options.length) {
        this.activeBookIndex = -1;
        return;
      }
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      this.activeBookIndex = (this.activeBookIndex + direction + options.length) % options.length;
    } else if (event.key === 'Enter' && this.bookOptionsVisible) {
      event.preventDefault();
      const activeBook = options[this.activeBookIndex];
      if (activeBook) {
        this.selectBook(activeBook.key);
      }
    } else if (event.key === 'Escape') {
      this.bookOptionsVisible = false;
      this.activeBookIndex = -1;
    }
  }

  onImportFromBookSubmit(): void {
    if (this.form.valid) {
      const { selectedBook, override, variations } = this.form.value;
      const selectedBookName = this.listBookNames().find(book => book.key === selectedBook)?.name ?? selectedBook;

      if (confirm(`Are you sure you want to import ${override ? 'and override ' : ''}patterns and lexicals from "${selectedBookName}"?`)) {
        targetsLoaderFn(selectedBook).then(projectData => {
          this.joinProjectData(projectData, variations, override);
          alert('Patterns and lexicals imported successfully');
        }).catch(e => {
          alert('Not possible to load book to import');
          console.error(e);
        });
      }

      this.form.reset({ selectedBook: '', override: false, variations: true });
      this.bookSearch = '';
    } else {
      this.form.markAllAsTouched();
    }
  }

  private normalizeBookSearch(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
  }

  private joinProjectData(projectData: ProjectData, variations: boolean, override: boolean): void {
    Object.keys(projectData).forEach(target => {
      if (this.isMetadataKey(target) && this.isTranslationKey(target)) {
        const importFromBook = projectData[target];
        const toBook = this.projectData[target];
        if (this.hasConfigs(toBook) && this.hasConfigs(importFromBook)) {
          this.importConfigs(toBook, importFromBook, override);
        }
  
        if (variations && this.isTranslation(toBook, target) && this.hasVariations(importFromBook)) {
          Object.keys(importFromBook.variations).forEach(variationId => {
            toBook.variations[variationId] = { ...importFromBook.variations[variationId] };
          });
        }
      }
    });
  }

  private isMetadataKey(key: string): key is KeyMetadata {
    return /\-metadata$/.test(key);
  }

  private isTranslationKey(key: string): key is KeyTranslation {
    return /\-translation$/.test(key);
  }

  private isTranslation(toBook: Book<object, object>, target: string): toBook is BookTranslationTarget {
    return /\-translation$/.test(target) && !!toBook;
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
