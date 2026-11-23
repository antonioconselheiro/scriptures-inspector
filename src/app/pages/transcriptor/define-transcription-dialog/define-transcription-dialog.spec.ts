import { TestBed } from '@angular/core/testing';
import { ArtifactFragmentWordPosition } from '@domain/artifact-fragment-word-position-model';
import { DefineTranscriptionDialog } from './define-transcription-dialog';

describe('DefineTranscriptionDialog', () => {
  it('only displays section tabs for a populated transcription', async () => {
    const fixture = TestBed.createComponent(DefineTranscriptionDialog);
    const dialog = fixture.componentInstance;
    dialog.onInjectData({ title: 'Edit', transcription: '', positions: [] });
    fixture.detectChanges();
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('.tabs')).toBeNull();
    expect(root.querySelector('[name="transcription"]')).not.toBeNull();
    const textarea = root.querySelector<HTMLTextAreaElement>('[name="transcription"]')!;
    textarea.value = 'abc';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const tabs = root.querySelectorAll<HTMLButtonElement>('.tabs button');
    expect(tabs.length).toBe(2);
    expect(tabs[0].getAttribute('aria-pressed')).toBe('true');
    tabs[1].click();
    fixture.detectChanges();
    expect(root.querySelector('[name="bookKey"]')).not.toBeNull();
    expect(root.querySelector('[name="start"]')).toBeNull();
    expect(root.querySelector('[name="transcription"]')).not.toBeNull();
    textarea.value = '';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(root.querySelector('.tabs')).toBeNull();
    fixture.destroy();
  });

  it('suggests project books and creates, edits and removes verse associations', async () => {
    const fixture = TestBed.createComponent(DefineTranscriptionDialog);
    const dialog = fixture.componentInstance;
    const original = [{ book: 'GEN', chapter: 1, verse: 1, start: 0, length: 3 }];
    dialog.onInjectData({ title: 'Edit', transcription: 'abc def', positions: [], bookSchema: original,
      books: { GEN: { name: 'Genesis' }, '1EN': { name: 'Enoch' } } });
    fixture.detectChanges();
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    root.querySelectorAll<HTMLButtonElement>('.tabs button')[1].click();
    fixture.detectChanges();
    await fixture.whenStable();
    const options = root.querySelectorAll<HTMLOptionElement>('#projectBookKeys option');
    expect(Array.from(options, option => option.value)).toEqual(['GEN', '1EN']);
    const enter = (selector: string, value: string): void => {
      const input = root.querySelector<HTMLInputElement>(selector)!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    };
    const source = root.querySelector<HTMLTextAreaElement>('[name="transcription"]')!;
    source.setSelectionRange(4, 7);
    source.dispatchEvent(new Event('select'));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(dialog.bookDraft.start).toBe(4);
    expect(dialog.bookDraft.end).toBe(7);
    enter('[name="bookKey"]', '1EN');
    enter('[name="bookChapter"]', '2');
    enter('[name="bookVerse"]', '3');
    Array.from(root.querySelectorAll('button')).find(button => button.textContent?.trim() === 'Add association')!.click();
    fixture.detectChanges();
    expect(dialog.bookSchema[1]).toEqual({ book: '1EN', chapter: 2, verse: 3, start: 4, length: 3 });
    expect(original.length).toBe(1);
    root.querySelectorAll<HTMLButtonElement>('.edit-selection')[0].click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect((root.querySelector('[name="bookEnd"]') as HTMLInputElement).value).toBe('3');
    enter('[name="bookVerse"]', '5');
    Array.from(root.querySelectorAll('button')).find(button => button.textContent?.trim() === 'Apply association')!.click();
    expect(dialog.bookSchema[0].verse).toBe(5);
    spyOn(window, 'confirm').and.returnValue(true);
    root.querySelector<HTMLButtonElement>('[aria-label="Delete book association 2"]')!.click();
    fixture.detectChanges();
    expect(dialog.bookSchema.length).toBe(1);
    const result = spyOn(dialog.response, 'next');
    spyOn(dialog, 'close');
    dialog.save();
    expect(result).toHaveBeenCalledWith({ transcription: 'abc def', positions: [],
      bookSchema: [{ book: 'GEN', chapter: 1, verse: 5, start: 0, length: 3 }] });
    expect(original[0].verse).toBe(1);
    fixture.destroy();
  });

  it('rejects invalid book keys, ranges and numbers without altering associations', () => {
    const dialog = TestBed.createComponent(DefineTranscriptionDialog).componentInstance;
    dialog.onInjectData({ title: 'Edit', transcription: 'abcd', positions: [] });
    const valid = { book: 'XYZ', start: 0, end: 4, chapter: 1, verse: 1 };
    for (const draft of [
      { ...valid, book: 'AB' }, { ...valid, book: 'AB!' }, { ...valid, start: -1 },
      { ...valid, start: 2, end: 2 }, { ...valid, end: 5 }, { ...valid, chapter: null },
      { ...valid, verse: -1 }, { ...valid, verse: 1.5 }
    ]) {
      dialog.bookDraft = draft;
      dialog.applyBookEdit();
      expect(dialog.bookSchema).toEqual([]);
      expect(dialog.bookError).toBeTruthy();
    }
    dialog.bookDraft = valid;
    dialog.applyBookEdit();
    expect(dialog.bookSchema.length).toBe(1);
  });

  it('rebases book associations and confirms before discarding affected ranges', () => {
    const dialog = TestBed.createComponent(DefineTranscriptionDialog).componentInstance;
    dialog.onInjectData({ title: 'Edit', transcription: 'abc def', positions: [], bookSchema: [
      { book: 'GEN', chapter: 1, verse: 1, start: 0, length: 3 },
      { book: 'GEN', chapter: 1, verse: 2, start: 4, length: 3 }
    ] });
    dialog.pendingText = 'xabc def';
    expect(dialog.syncText()).toBeTrue();
    expect(dialog.bookSchema.map(item => item.start)).toEqual([1, 5]);
    const confirm = spyOn(window, 'confirm').and.returnValue(false);
    dialog.pendingText = 'xXYZ def';
    expect(dialog.syncText()).toBeFalse();
    expect(dialog.bookSchema.length).toBe(2);
    confirm.and.returnValue(true);
    dialog.pendingText = 'xXYZ def';
    expect(dialog.syncText()).toBeTrue();
    expect(dialog.bookSchema.map(item => item.verse)).toEqual([2]);
  });

  it('keeps book associations when deletion is cancelled and targets the correct rebased entry', () => {
    const dialog = TestBed.createComponent(DefineTranscriptionDialog).componentInstance;
    dialog.onInjectData({ title: 'Edit', transcription: 'abc def ghi', positions: [], bookSchema: [
      { book: 'GEN', chapter: 1, verse: 1, start: 0, length: 3 },
      { book: 'GEN', chapter: 1, verse: 2, start: 4, length: 3 },
      { book: 'GEN', chapter: 1, verse: 3, start: 8, length: 3 }
    ] });
    const confirmation = spyOn(window, 'confirm').and.returnValue(false);
    dialog.deleteBookEdit(1);
    expect(dialog.bookSchema.length).toBe(3);
    confirmation.and.returnValue(true);
    dialog.pendingText = 'xxx def ghi';
    dialog.deleteBookEdit(1);
    expect(dialog.bookSchema.map(item => item.verse)).toEqual([3]);
  });

  it('edits ranges independently and returns them with the transcription', () => {
    const dialog = TestBed.createComponent(DefineTranscriptionDialog).componentInstance;
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
      bookSchema: [],
      positions: [
        { start: 0, length: 3, x: 1, y: 2, flip: 45, fontSize: 30, letterSpacing: 2 },
        { start: 4, length: 3, x: 10, y: 20, flip: 5, fontSize: 20, letterSpacing: 1, id: jasmine.any(String) }
      ]
    });
  });

  it('prevents overlapping ranges and preserves data when text-change confirmation is declined', () => {
    const dialog = TestBed.createComponent(DefineTranscriptionDialog).componentInstance;
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
    const dialog = TestBed.createComponent(DefineTranscriptionDialog).componentInstance;
    dialog.onInjectData({ title: 'Edit', transcription: 'abc def', positions: [
      { start: 0, length: 7, x: 10, y: 20, flip: 30 }
    ] });
    dialog.draft = { start: 1, length: 2, x: 4, y: 5, flip: 10 };
    dialog.applyEdit();
    expect(dialog.positions[1].parentId).toBe(dialog.positions[0].id);
    dialog.pendingText = 'xabc def';
    expect(dialog.syncText()).toBeTrue();
    expect(dialog.positions[0].start).toBe(1);
    expect(dialog.positions[1].start).toBe(2);
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
    const dialog = TestBed.createComponent(DefineTranscriptionDialog).componentInstance;
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

  it('lists limited excerpts above the editable form without a fragment preview', async () => {
    const fixture = TestBed.createComponent(DefineTranscriptionDialog);
    const dialog = fixture.componentInstance;
    const text = 'a'.repeat(100);
    dialog.onInjectData({
      title: 'Edit', transcription: text,
      positions: [{ start: 0, length: 100, x: 10, y: 20, flip: 0 }],
      spelling: { name: 'Test', label: 'test', parse: value => value.toUpperCase(), font: 'serif' }
    });
    fixture.detectChanges();
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('app-artifact-text-editor-component, .graphicsWrapper, svg, img')).toBeNull();
    const button: HTMLButtonElement = root.querySelector('.edit-selection')!;
    expect(button.textContent).toContain('0 + 100');
    expect(button.querySelector('.edit-excerpt')!.textContent).toBe('A'.repeat(60) + '…');
    expect(button.title).toBe('A'.repeat(100));
    expect(button.compareDocumentPosition(root.querySelector('[name="start"]')!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    button.click();
    fixture.detectChanges();
    expect(dialog.draft.x).toBe(10);
    expect(button.getAttribute('aria-pressed')).toBe('true');
    const x = root.querySelector<HTMLInputElement>('[name="x"]')!;
    x.value = '42';
    x.dispatchEvent(new Event('input'));
    const apply = Array.from(root.querySelectorAll('button')).find(item => item.textContent?.trim() === 'Apply edit')!;
    apply.click();
    expect(dialog.positions[0].x).toBe(42);
    fixture.destroy();
  });

  it('confirms single and bulk deletions without changing the original', async () => {
    const fixture = TestBed.createComponent(DefineTranscriptionDialog);
    const dialog = fixture.componentInstance;
    const original = [
      { start: 0, length: 3, x: 10, y: 10, flip: 0 },
      { start: 4, length: 3, x: 60, y: 10, flip: 0 }
    ];
    dialog.onInjectData({ title: 'Edit', transcription: 'abc def', positions: original });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.nativeElement.querySelector('[aria-label="Delete edit 1"]').click();
    fixture.detectChanges();
    expect(dialog.selectedIndex).toBe(0);
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('[name="transcription"]');
    expect(textarea.selectionStart).toBe(0);
    expect(textarea.selectionEnd).toBe(3);
    expect(fixture.nativeElement.querySelector('.delete-confirmation').textContent).toContain('abc');
    fixture.nativeElement.querySelector('.delete-confirmation button:last-child').click();
    fixture.detectChanges();
    expect(dialog.positions.length).toBe(2);
    const checks: NodeListOf<HTMLInputElement> = fixture.nativeElement.querySelectorAll('.edits-list input');
    checks.forEach(check => check.click());
    fixture.detectChanges();
    const bulk = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.trim() === 'Delete selected edits')!;
    bulk.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.delete-confirmation').textContent).toContain('def');
    fixture.nativeElement.querySelector('.delete-confirmation button:first-of-type').click();
    fixture.detectChanges();
    expect(dialog.positions).toEqual([]);
    expect(original.length).toBe(2);
    fixture.destroy();
  });

  it('uses the editor to preserve nested edits when their parent is deleted', () => {
    const dialog = TestBed.createComponent(DefineTranscriptionDialog).componentInstance;
    const child: ArtifactFragmentWordPosition = { id: 'child', start: 1, length: 2, x: 10, y: 20, flip: 20 };
    const promote = jasmine.createSpy().and.returnValue([child]);
    dialog.onInjectData({
      title: 'Edit', transcription: 'abc def',
      positions: [
        { id: 'parent', start: 0, length: 7, x: 30, y: 20, flip: 20 },
        { ...child, parentId: 'parent' }
      ],
      deletePositions: promote
    });
    const before = dialog.positions;
    dialog.requestDelete([0]);
    dialog.confirmDelete();
    expect(promote).toHaveBeenCalledWith('abc def', before, new Set([0]));
    expect(dialog.positions).toEqual([child]);
  });

  it('does not remove a parent when nested edits cannot be preserved', () => {
    const dialog = TestBed.createComponent(DefineTranscriptionDialog).componentInstance;
    dialog.onInjectData({ title: 'Edit', transcription: 'abc', positions: [
      { id: 'parent', start: 0, length: 3, x: 0, y: 0, flip: 0 },
      { parentId: 'parent', start: 1, length: 1, x: 0, y: 0, flip: 0 }
    ] });
    dialog.requestDelete([0]);
    dialog.confirmDelete();
    expect(dialog.positions.length).toBe(2);
    expect(dialog.error).toContain('Unable to preserve nested edits');
    expect(dialog.pendingDeletion).toEqual([0]);
  });

  it('does not target the wrong edit when pending text removes an earlier edit', () => {
    const dialog = TestBed.createComponent(DefineTranscriptionDialog).componentInstance;
    dialog.onInjectData({ title: 'Edit', transcription: 'abc def ghi', positions: [
      { start: 0, length: 3, x: 0, y: 0, flip: 0 },
      { start: 4, length: 3, x: 0, y: 0, flip: 0 },
      { start: 8, length: 3, x: 0, y: 0, flip: 0 }
    ] });
    spyOn(window, 'confirm').and.returnValue(true);
    dialog.pendingText = 'xxx def ghi';
    dialog.requestDelete([1]);
    expect(dialog.pendingDeletion).toEqual([0]);
    expect(dialog.editText(0)).toBe('def');
    dialog.confirmDelete();
    expect(dialog.positions.length).toBe(1);
    expect(dialog.editText(0)).toBe('ghi');
  });
});
