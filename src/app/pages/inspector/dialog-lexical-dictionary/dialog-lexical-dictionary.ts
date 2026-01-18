import { Component, OnInit } from '@angular/core';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { BookMetadataAttributes } from '@domain/book-metadata-attributes-model';
import { Book } from '@domain/book-model';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-dialog-lexical-dictionary',
  imports: [],
  templateUrl: './dialog-lexical-dictionary.html',
  styleUrl: './dialog-lexical-dictionary.scss'
})
export class DialogLexicalDictionary extends ModalableDirective<Book<BookMetadataAttributes, any>, boolean> implements OnInit {

  book: Book<BookMetadataAttributes, any> | null = null;
  dictionary: Array<{ key: string; value: string; }> = [];
  override response = new Subject<boolean | void>();

  override onInjectData(book: Book<BookMetadataAttributes, any>): void {
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
