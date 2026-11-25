import { FormBuilder } from '@angular/forms';
import { Book } from '@domain/book-model';
import { BookMetadataAttributes } from '@domain/book-metadata-attributes-model';
import { ImportFromBookDialog } from './import-from-book-dialog';
import { SegmentationChanges } from '../translation-editor/shared/segmentation-changes';

describe('ImportFromBookDialog', () => {
  it('imports distinct patterns and applies override rules per context and morpheme', () => {
    const dialog = new ImportFromBookDialog(new FormBuilder(), new SegmentationChanges());
    const current: Book<BookMetadataAttributes> = {
      chapters: [],
      lexical: {},
      patterns: {
        distinct: {
          word: { prefix: 'pre', suffix: 'ing' }
        },
        prefix: [],
        suffix: [],
        lexeme: []
      }
    };
    const imported: Book<BookMetadataAttributes> = {
      chapters: [],
      lexical: {},
      patterns: {
        distinct: {
          word: { prefix: 're' },
          other: { suffix: 'ed' }
        },
        prefix: [],
        suffix: [],
        lexeme: []
      }
    };
    const importConfigs = Reflect.get(dialog, 'importConfigs') as (
      destination: Book<BookMetadataAttributes>,
      source: Book<BookMetadataAttributes>,
      override: boolean
    ) => void;

    importConfigs.call(dialog, current, imported, false);
    expect(current.patterns.distinct).toEqual({
      word: { prefix: 'pre', suffix: 'ing' },
      other: { suffix: 'ed' }
    });

    importConfigs.call(dialog, current, imported, true);
    expect(current.patterns.distinct).toEqual({
      word: { prefix: 're' },
      other: { suffix: 'ed' }
    });
  });
});
