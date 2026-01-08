import { Component, OnInit } from '@angular/core';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { Subject } from 'rxjs';
import { DocumentStorage } from '../document-storage';
import { BookMetadata } from '@domain/book-metadata-model';
import { Book } from '@domain/book-model';

@Component({
  selector: 'app-dialog-lexical-dictionary',
  imports: [],
  templateUrl: './dialog-lexical-dictionary.html',
  styleUrl: './dialog-lexical-dictionary.scss'
})
export class DialogDictionary extends ModalableDirective<Book<BookMetadata>, boolean> implements OnInit {

  book: Book<BookMetadata> | null = null;
  dictionary: Array<{ key: string; value: string; }> = [];
  override response = new Subject<boolean | void>();

  constructor(
    private literalsStorage: DocumentStorage
  ) {
    super();
  }

  override onInjectData(book: Book<BookMetadata>): void {
    this.book = book;
  }

  ngOnInit(): void {
    this.dictionary = this.getLexicalDictionary();
  }

  getLexicalDictionary(): Array<{ key: string; value: string; }> {
    if (this.book) {
      return Object.entries(this.book.lexical).map(([key, value]) => ({
        key,
        value
      }));
    }

    return [];
  }

  deleteFromDictionary(key: string): void {
    if (this.book) {
      delete this.book.lexical[key];
    }
    this.dictionary = this.getLexicalDictionary();
  }
}
