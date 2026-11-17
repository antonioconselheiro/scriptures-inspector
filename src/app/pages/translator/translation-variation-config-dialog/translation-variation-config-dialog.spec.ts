import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { FormBuilder } from '@angular/forms';
import { BookTranslationTarget } from '@domain/book-translation-target-model';
import { TranslationVariationConfigDialog } from './translation-variation-config-dialog';

describe('TranslationVariationConfigDialog', () => {
  it('should reorder variation keys on the book', () => {
    const dialog = new TranslationVariationConfigDialog(new FormBuilder());
    dialog.book = {
      variations: {
        first: { name: 'First' },
        second: { name: 'Second' },
        third: { name: 'Third' }
      },
      chapters: []
    } satisfies BookTranslationTarget;

    dialog.drop({ previousIndex: 0, currentIndex: 2 } as CdkDragDrop<BookTranslationTarget['variations']>);

    expect(Object.keys(dialog.book.variations)).toEqual(['second', 'third', 'first']);
    expect(dialog.book.variations).toEqual({
      second: { name: 'Second' },
      third: { name: 'Third' },
      first: { name: 'First' }
    });
  });
});
