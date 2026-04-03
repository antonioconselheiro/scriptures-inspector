import { Component } from '@angular/core';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { Project } from '@domain/project-model';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-dialog-import-from-book',
  imports: [],
  templateUrl: './dialog-import-from-book.html',
  styleUrl: './dialog-import-from-book.scss',
})
export class DialogImportFromBook extends ModalableDirective<{ project: Project, book: string }, void> {

  book!: string;
  project!: Project;

  override response = new Subject<void>();

  override onInjectData(data: { project: Project, book: string }): void {
    this.book = data.book;
    this.project = data.project;
  }

  listBookNames(): Array<{ key: string, name: string }> {
    return Object.keys(this.project.target.books).map(book => {
      return {
        key: book,
        name: this.project.target.books[book].name
      };
    });
  }
}
