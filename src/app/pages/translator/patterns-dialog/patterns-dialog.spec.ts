import { FormBuilder } from '@angular/forms';
import { PatternsSerialized } from '@domain/patterns-serialized-model';
import { PatternsService } from '../patterns-service';
import { PatternsDialog } from './patterns-dialog';
import { SegmentationChanges } from '../translation-editor/shared/segmentation-changes';

describe('PatternsDialog', () => {
  it('should populate the table patterns when its inputs change', () => {
    const dialog = new PatternsDialog(new FormBuilder(), new PatternsService(new SegmentationChanges()));
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

  it('should list and remove distinct segment definitions', () => {
    const confirmation = spyOn(window, 'confirm').and.returnValue(false);
    const dialog = new PatternsDialog(new FormBuilder(), new PatternsService(new SegmentationChanges()));
    dialog.patterns = {
      distinct: { careful: { suffix: 'ful' } },
      prefix: [],
      suffix: [],
      lexeme: []
    };

    dialog.ngOnChanges();

    expect(dialog.sortedPatterns).toEqual([
      {
        type: 'suffix',
        pattern: 'ful',
        index: 0,
        onlyInContext: 'careful'
      }
    ]);
    dialog.sortBy = 'type';
    dialog.sortOrder = 'suffix-first';
    dialog.sortPatterns();
    expect(dialog.sortedPatterns[0].type).toBe('suffix');
    dialog.deletePattern(dialog.sortedPatterns[0]);
    expect(confirmation).toHaveBeenCalledWith('Delete the suffix pattern "ful" in the context "careful"?');
    expect(dialog.patterns.distinct).toEqual({ careful: { suffix: 'ful' } });
    expect(dialog.sortedPatterns.length).toBe(1);
    confirmation.and.returnValue(true);
    dialog.deletePattern(dialog.sortedPatterns[0]);
    expect(dialog.patterns.distinct).toEqual({});
  });

  it('only removes a regular pattern after confirmation', () => {
    const confirmation = spyOn(window, 'confirm').and.returnValue(false);
    const dialog = new PatternsDialog(new FormBuilder(), new PatternsService(new SegmentationChanges()));
    dialog.patterns = { prefix: ['un', 're'], suffix: [], lexeme: [] };
    dialog.ngOnChanges();
    dialog.deletePattern(dialog.sortedPatterns[0]);
    expect(confirmation).toHaveBeenCalledWith('Delete the prefix pattern "un"?');
    expect(dialog.patterns.prefix).toEqual(['un', 're']);
    confirmation.and.returnValue(true);
    dialog.deletePattern(dialog.sortedPatterns[0]);
    expect(dialog.patterns.prefix).toEqual(['re']);
  });
});
