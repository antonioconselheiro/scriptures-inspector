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

  it('shares preview toggles, selection, formatting and bulk deletion without changing the original', () => {
    const fixture = TestBed.createComponent(DefineTranscriptionDialog);
    const dialog = fixture.componentInstance;
    const original = [
      { start: 0, length: 3, x: 10, y: 10, flip: 0 },
      { start: 4, length: 3, x: 60, y: 10, flip: 0 }
    ];
    dialog.onInjectData({
      title: 'Edit', transcription: 'abc def', positions: original,
      vector: '<svg width="200" height="100"></svg>',
      language: { name: 'Test', label: 'test', direction: 'rtl' },
      spelling: { name: 'Test', label: 'test', parse: text => text.toUpperCase(), font: 'serif' }
    });
    fixture.detectChanges();

    const toggle: HTMLInputElement = fixture.nativeElement.querySelector('[name="showTranscriptionPositioning"]');
    expect(getComputedStyle(toggle).opacity).toBe('1');
    expect(toggle.getBoundingClientRect().width).toBeGreaterThan(1);
    const text: HTMLElement = fixture.nativeElement.querySelector('[data-fragment-index="0"] [data-segment-start]');
    expect(text.textContent).toBe('ABC');
    expect(getComputedStyle(text).visibility).toBe('visible');
    toggle.click();
    fixture.detectChanges();
    expect(getComputedStyle(text).visibility).toBe('hidden');
    toggle.click();
    fixture.detectChanges();
    expect(getComputedStyle(text).visibility).toBe('visible');

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.edit-panel li button');
    expect(button.textContent?.trim()).toBe('0 + 3');
    expect(button.title).toBe('ABC');
    button.click();
    fixture.detectChanges();
    expect(dialog.selectedIndex).toBe(0);
    expect(dialog.draft.start).toBe(0);
    const font: HTMLInputElement = fixture.nativeElement.querySelector('[aria-label="Font size in pixels"]');
    font.value = '20';
    font.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(dialog.positions[0].fontSize).toBe(20);
    expect(dialog.draft.fontSize).toBe(20);
    expect(original[0].flip).toBe(0);
    expect('fontSize' in original[0]).toBeFalse();

    const checks: NodeListOf<HTMLInputElement> = fixture.nativeElement.querySelectorAll('.edit-panel li input[type="checkbox"]');
    checks.forEach(check => check.click());
    fixture.detectChanges();
    const bulk: HTMLButtonElement = [...fixture.nativeElement.querySelectorAll('.edit-panel button')]
      .find((element: HTMLButtonElement) => element.textContent?.trim() === 'Delete selected edits')!;
    bulk.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.delete-confirmation').textContent).toContain('ABC');
    const cancel: HTMLButtonElement = fixture.nativeElement.querySelector('.delete-confirmation button:last-child');
    cancel.click();
    fixture.detectChanges();
    expect(dialog.positions.length).toBe(2);
    bulk.click();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.delete-confirmation button:first-of-type').click();
    fixture.detectChanges();
    expect(dialog.positions).toEqual([]);
    expect(original.length).toBe(2);
    fixture.destroy();
  });

  it('moves a preview selection and keeps the numeric form synchronized', async () => {
    const fixture = TestBed.createComponent(DefineTranscriptionDialog);
    const dialog = fixture.componentInstance;
    const original = [{ start: 0, length: 3, x: 20, y: 20, flip: 0 }];
    dialog.onInjectData({
      title: 'Edit', transcription: 'abc def', positions: original,
      vector: '<svg width="200" height="100"></svg>'
    });
    fixture.detectChanges();
    const fragment: HTMLElement = fixture.nativeElement.querySelector('.artifact-fragment');
    fragment.click();
    fixture.detectChanges();
    await new Promise<void>(resolve => setTimeout(resolve, 50));
    const rect = fragment.getBoundingClientRect();
    fragment.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: rect.left + 5, clientY: rect.top + 5, buttons: 1 }));
    window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: rect.left + 25, clientY: rect.top + 15, buttons: 1 }));
    fragment.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: rect.left + 25, clientY: rect.top + 15 }));
    fragment.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: rect.left + 25, clientY: rect.top + 15 }));
    fixture.detectChanges();
    expect(dialog.positions[0].x).toBeCloseTo(40, 0);
    expect(dialog.draft.x).toBeCloseTo(40, 0);
    expect(original[0].x).toBe(20);
    await fixture.whenStable();
    fixture.detectChanges();
    const rotation: HTMLInputElement = fixture.nativeElement.querySelector('[name="rotation"]');
    rotation.value = '45';
    rotation.dispatchEvent(new Event('input'));
    expect(dialog.draft.flip).toBe(45);
    expect(dialog.selectedIndex).toBe(0);
    const apply: HTMLButtonElement = [...fixture.nativeElement.querySelectorAll('.position-fields button')]
      .find((button: HTMLButtonElement) => button.textContent?.includes('Apply edit'))!;
    expect(apply).toBeDefined();
    apply.click();
    fixture.detectChanges();
    expect(dialog.positions[0].flip).toBe(45);
    expect(fragment.classList.contains('selected')).toBeTrue();
    expect(fixture.nativeElement.querySelector('.floating-toolbar')).not.toBeNull();
    const response = spyOn(dialog.response, 'next');
    spyOn(dialog, 'close');
    dialog.save();
    expect(response).toHaveBeenCalledWith({ transcription: 'abc def', positions: dialog.positions });
    fixture.destroy();
  });

  it('constrains Shift dragging in the dialog preview without modifying the original', async () => {
    const fixture = TestBed.createComponent(DefineTranscriptionDialog);
    const original = [{ start: 0, length: 3, x: 20, y: 20, flip: 0 }];
    fixture.componentInstance.onInjectData({
      title: 'Edit', transcription: 'abc def', positions: original,
      vector: '<svg width="200" height="100"></svg>'
    });
    fixture.detectChanges();
    const fragment: HTMLElement = fixture.nativeElement.querySelector('.artifact-fragment');
    fragment.click();
    fixture.detectChanges();
    await new Promise<void>(resolve => setTimeout(resolve, 50));
    const before = fragment.getBoundingClientRect();
    fragment.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: before.left + 5, clientY: before.top + 5, buttons: 1 }));
    window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: before.left + 25, clientY: before.top + 35, buttons: 1, shiftKey: true }));
    fixture.detectChanges();
    expect(fragment.getBoundingClientRect().left - before.left).toBeCloseTo(20, 0);
    expect(fragment.getBoundingClientRect().top).toBeCloseTo(before.top, 0);
    expect(fixture.nativeElement.querySelector('.horizontal-drag-guide')).not.toBeNull();
    expect(fixture.componentInstance.draft.x).toBeCloseTo(40, 0);
    expect(original[0].x).toBe(20);
    fragment.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: before.left + 25, clientY: before.top + 35, shiftKey: true }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.horizontal-drag-guide')).toBeNull();
    fixture.destroy();
  });

  it('preserves unselected nested edits when their parent is deleted in the dialog', () => {
    const fixture = TestBed.createComponent(DefineTranscriptionDialog);
    const dialog = fixture.componentInstance;
    dialog.onInjectData({
      title: 'Edit', transcription: 'abc def',
      vector: '<svg width="200" height="100"></svg>',
      positions: [
        { id: 'parent', start: 0, length: 7, x: 30, y: 20, flip: 20 },
        { id: 'child', parentId: 'parent', start: 1, length: 2, x: 5, y: 5, flip: 0 }
      ]
    });
    fixture.detectChanges();
    const child: HTMLElement = fixture.nativeElement.querySelector('[data-fragment-index="1"]');
    const before = child.getBoundingClientRect();
    fixture.nativeElement.querySelector('[aria-label="Delete edit 1"]').click();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.delete-confirmation button:first-of-type').click();
    fixture.detectChanges();
    const after = (fixture.nativeElement.querySelector('[data-fragment-index="0"]') as HTMLElement).getBoundingClientRect();
    expect(dialog.positions.length).toBe(1);
    expect(dialog.positions[0].parentId).toBeUndefined();
    expect(after.left).toBeCloseTo(before.left, 0);
    expect(after.top).toBeCloseTo(before.top, 0);
    fixture.destroy();
  });

  it('creates line edits in the preview and saves them without modifying the original data', () => {
    const fixture = TestBed.createComponent(DefineTranscriptionDialog);
    const dialog = fixture.componentInstance;
    const positions: { start: number; length: number; x: number; y: number; flip: number }[] = [];
    dialog.onInjectData({
      title: 'Edit', transcription: 'abc\ndef', positions,
      vector: '<svg width="200" height="100"></svg>'
    });
    fixture.detectChanges();
    const createLines: HTMLButtonElement = [...fixture.nativeElement.querySelectorAll('.edit-panel > button')]
      .find((button: HTMLButtonElement) => button.textContent?.includes('each line'))!;
    createLines.click();
    fixture.detectChanges();
    expect(dialog.positions.map(position => [position.start, position.length])).toEqual([[0, 3], [4, 3]]);
    expect(positions).toEqual([]);
    const response = spyOn(dialog.response, 'next');
    spyOn(dialog, 'close');
    dialog.save();
    expect(response).toHaveBeenCalledWith({ transcription: 'abc\ndef', positions: dialog.positions });
    fixture.destroy();
  });
});
