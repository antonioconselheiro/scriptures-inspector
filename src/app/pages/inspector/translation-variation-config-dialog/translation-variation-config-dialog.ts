import { Component, OnInit } from '@angular/core';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { BookTranslationTarget } from '@domain/book-translation-target-model';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-translation-variation-config-dialog',
  imports: [],
  templateUrl: './translation-variation-config-dialog.html',
  styleUrl: './translation-variation-config-dialog.scss',
})
export class TranslationVariationConfigDialog extends ModalableDirective<BookTranslationTarget, boolean> {

  book: BookTranslationTarget | null = null;

  override response = new Subject<boolean | void>();

  override onInjectData(book: BookTranslationTarget): void {
    this.book = book;
  }

  getVariations(): Array<{
    key: string,
    name: string
  }> {
    const book = this.book;
    if (!book) {
      return [];
    }

    return Object.keys(book.variations).map(key => {
      return {
        key,
        ...book.variations[key]
      }
    })
  }

  //  TODO: precisará deletar de todos os capitulos dos livros
  deleteVariant(key: string): void {
    if (confirm('Are you sure you want to remove this variation? This deletion is irreversible.')) {

    }
  }
}
