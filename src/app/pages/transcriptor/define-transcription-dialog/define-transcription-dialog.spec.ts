import { TestBed } from '@angular/core/testing';
import { DefineTranscriptionDialog } from './define-transcription-dialog';

describe('DefineTranscriptionDialog', () => {
  it('edits ranges independently and returns them with the transcription', () => {
    const fixture = TestBed.createComponent(DefineTranscriptionDialog);
    const dialog = fixture.componentInstance;
    const original = [{ start: 0, length: 3, x: 1, y: 2, flip: 0 }];
    dialog.onInjectData({ title: 'Edit', transcription: 'abc def', positions: original });
    dialog.selectEdit(0);
    dialog.draft.fontSize = 30;
    dialog.draft.letterSpacing = 2;
    dialog.draft.flip = 45;
    dialog.applyEdit();
    expect(original[0].flip).toBe(0);
    dialog.newEdit();
    dialog.draft = { start: 4, length: 3, x: 10, y: 20, flip: 5, fontSize: 20, letterSpacing: 1 };
    dialog.applyEdit();
    const result = spyOn(dialog.response, 'next');
    spyOn(dialog, 'close');
    dialog.save();
    expect(result).toHaveBeenCalledWith({
      transcription: 'abc def',
      positions: [
        { start: 0, length: 3, x: 1, y: 2, flip: 45, fontSize: 30, letterSpacing: 2 },
        { start: 4, length: 3, x: 10, y: 20, flip: 5, fontSize: 20, letterSpacing: 1, id: jasmine.any(String) }
      ]
    });
  });

  it('prevents overlapping ranges and preserves data when text-change confirmation is declined', () => {
    const fixture = TestBed.createComponent(DefineTranscriptionDialog);
    const dialog = fixture.componentInstance;
    dialog.onInjectData({ title: 'Edit', transcription: 'abc def', positions: [{ start: 0, length: 3, x: 0, y: 0, flip: 0 }] });
    dialog.draft = { start: 2, length: 3, x: 0, y: 0, flip: 0 };
    dialog.applyEdit();
    expect(dialog.error).toContain('disjoint');
    const confirmation = spyOn(window, 'confirm').and.returnValue(false);
    dialog.pendingText = 'xyz def';
    expect(dialog.syncText()).toBeFalse();
    expect(dialog.pendingText).toBe('abc def');
    expect(dialog.positions.length).toBe(1);
    confirmation.and.returnValue(true);
    dialog.pendingText = 'xyz def';
    expect(dialog.syncText()).toBeTrue();
    expect(dialog.positions).toEqual([]);
  });

  it('creates nested edits, keeps their coordinates relative, and rebases them with their parent', () => {
    const fixture = TestBed.createComponent(DefineTranscriptionDialog);
    const dialog = fixture.componentInstance;
    dialog.onInjectData({ title: 'Edit', transcription: 'abc def', positions: [
      { start: 0, length: 7, x: 10, y: 20, flip: 30 }
    ] });
    dialog.draft = { start: 1, length: 2, x: 4, y: 5, flip: 10 };
    dialog.applyEdit();
    expect(dialog.positions.length).toBe(2);
    expect(dialog.positions[1].parentId).toBe(dialog.positions[0].id);
    expect(dialog.positions[1].x).toBe(4);
    dialog.pendingText = 'xabc def';
    expect(dialog.syncText()).toBeTrue();
    expect(dialog.positions[0].start).toBe(1);
    expect(dialog.positions[1].start).toBe(2);
    expect(dialog.positions[1].parentId).toBe(dialog.positions[0].id);
    dialog.selectEdit(0);
    dialog.draft.length = 1;
    dialog.applyEdit();
    expect(dialog.error).toContain('nested edit');
    spyOn(window, 'confirm').and.returnValue(true);
    dialog.pendingText = 'xabc xyz';
    dialog.syncText();
    expect(dialog.positions).toEqual([]);
  });

  it('keeps the dialog open when positions exceed the image bounds', () => {
    const fixture = TestBed.createComponent(DefineTranscriptionDialog);
    const dialog = fixture.componentInstance;
    const validate = jasmine.createSpy().and.returnValue('Position outside image bounds.');
    dialog.onInjectData({ title: 'Edit', transcription: 'abc', positions: [
      { start: 0, length: 1, x: 500, y: 0, flip: 0 }
    ], validatePositions: validate });
    const response = spyOn(dialog.response, 'next');
    const close = spyOn(dialog, 'close');
    dialog.save();
    expect(validate).toHaveBeenCalled();
    expect(dialog.error).toContain('outside');
    expect(response).not.toHaveBeenCalled();
    expect(close).not.toHaveBeenCalled();
  });
});
