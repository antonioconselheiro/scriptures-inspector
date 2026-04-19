import { Component, OnInit } from '@angular/core';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { BookMetadataAttributes } from '@domain/book-metadata-attributes-model';
import { Book } from '@domain/book-model';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-lexical-dictionary-dialog',
  imports: [],
  templateUrl: './lexical-dictionary-dialog.html',
  styleUrl: './lexical-dictionary-dialog.scss'
})
export class LexicalDictionaryDialog extends ModalableDirective<Book<BookMetadataAttributes, any>, boolean> implements OnInit {

  book: Book<BookMetadataAttributes, any> | null = null;
  lexicals: Array<{ key: string; value: string; }> = [];

  override response = new Subject<boolean | void>();

  override onInjectData(book: Book<BookMetadataAttributes, any>): void {
    this.book = book;
  }

  ngOnInit(): void {
    this.lexicals = this.getLexicalDictionary();
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

  deleteLexical(key: string): void {
    if (this.book) {
      delete this.book.lexical[key];
    }

    this.lexicals = this.getLexicalDictionary();
  }
}
