import { FormBuilder } from '@angular/forms';
import { PatternsSerialized } from '@domain/patterns-serialized-model';
import { PatternsService } from '../patterns-service';
import { PatternsDialog } from './patterns-dialog';

describe('PatternsDialog', () => {
  it('should populate the table patterns when its inputs change', () => {
    const dialog = new PatternsDialog(new FormBuilder(), new PatternsService());
    dialog.patterns = {
      prefix: ['un'],
      suffix: ['ing'],
      lexeme: ['run']
    } satisfies PatternsSerialized;

    dialog.ngOnChanges();

    expect(dialog.sortedPatterns).toEqual([
      { type: 'prefix', pattern: 'un', index: 0 },
      { type: 'suffix', pattern: 'ing', index: 0 },
      { type: 'lexeme', pattern: 'run', index: 0 }
    ]);
  });
});
