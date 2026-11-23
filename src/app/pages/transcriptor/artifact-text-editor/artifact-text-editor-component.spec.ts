import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ArtifactFragmentWordPosition } from '@domain/artifact-fragment-word-position-model';
import { ArtifactTextEditorComponent } from './artifact-text-editor-component';

@Component({
  imports: [ArtifactTextEditorComponent],
  template: `<app-artifact-text-editor-component [text]="text" [(fragments)]="positions"
    [language]="language" [spelling]="spelling" />`
})
class Host {
  text = 'First second';
  positions: ArtifactFragmentWordPosition[] = [];
  language: { name: string; label: string; direction: 'rtl' | 'ltr' } = { name: 'Test', label: 'test', direction: 'rtl' };
  spelling = { name: 'Test', label: 'test', parse: (text: string) => text.toUpperCase(), font: 'serif' };
}

@Component({
  imports: [ArtifactTextEditorComponent],
  template: `<div style="display:grid; grid-template-columns: 200px 320px">
    <div #bounds style="grid-area:1 / 1;width:200px;height:100px"></div>
    <app-artifact-text-editor-component text="First second" [(fragments)]="positions" [boundsElement]="bounds" />
  </div>`
})
class BoundedHost {
  positions: ArtifactFragmentWordPosition[] = [];
}

describe('ArtifactTextEditorComponent', () => {
  it('cancels a drag with the right mouse button and allows a new drag', async () => {
    const fixture = TestBed.createComponent(BoundedHost);
    fixture.componentInstance.positions = [{ start: 0, length: 5, x: 30, y: 30, flip: 0, fontSize: 16 }];
    fixture.detectChanges();
    const fragment: HTMLElement = fixture.nativeElement.querySelector('.artifact-fragment');
    fragment.click();
    fixture.detectChanges();
    await new Promise<void>(resolve => setTimeout(resolve, 50));
    const before = fragment.getBoundingClientRect();
    fragment.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: before.left + 5, clientY: before.top + 5, button: 0, buttons: 1 }));
    window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: before.left + 35, clientY: before.top + 25, buttons: 1, shiftKey: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.positions[0].x).not.toBe(30);
    expect(fixture.nativeElement.querySelector('.horizontal-drag-guide')).not.toBeNull();
    fragment.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 2, buttons: 3 }));
    const menu = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 });
    fragment.dispatchEvent(menu);
    fixture.detectChanges();
    expect(menu.defaultPrevented).toBeTrue();
    expect(fixture.componentInstance.positions[0]).toEqual({ start: 0, length: 5, x: 30, y: 30, flip: 0, fontSize: 16 });
    expect(fragment.getBoundingClientRect().left).toBeCloseTo(before.left, 0);
    expect(fixture.nativeElement.querySelector('.horizontal-drag-guide')).toBeNull();
    window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: before.left + 55, clientY: before.top + 35, buttons: 1 }));
    window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 0 }));
    fixture.detectChanges();
    expect(fixture.componentInstance.positions[0].x).toBe(30);
    expect(fixture.componentInstance.positions[0].y).toBe(30);
    await new Promise<void>(resolve => setTimeout(resolve, 50));
    fragment.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: before.left + 5, clientY: before.top + 5, button: 0, buttons: 1 }));
    window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: before.left + 15, clientY: before.top + 15, buttons: 1 }));
    window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 0 }));
    fixture.detectChanges();
    expect(fixture.componentInstance.positions[0].x).toBeCloseTo(40, 0);
    expect(fixture.componentInstance.positions[0].y).toBeCloseTo(40, 0);
    const normalMenu = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 });
    fragment.dispatchEvent(normalMenu);
    expect(normalMenu.defaultPrevented).toBeFalse();
    fixture.destroy();
  });

  it('restores a nested edit relative to its rotated parent when cancelling a drag', async () => {
    const fixture = TestBed.createComponent(BoundedHost);
    const original: ArtifactFragmentWordPosition[] = [
      { id: 'parent', start: 0, length: 5, x: 55, y: 30, flip: 30 },
      { id: 'child', parentId: 'parent', start: 1, length: 3, x: 4, y: 2, flip: 15 }
    ];
    fixture.componentInstance.positions = original.map(position => ({ ...position }));
    fixture.detectChanges();
    const child: HTMLElement = fixture.nativeElement.querySelector('[data-fragment-index="1"]');
    child.click();
    fixture.detectChanges();
    await new Promise<void>(resolve => setTimeout(resolve, 50));
    const before = child.getBoundingClientRect();
    child.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: before.left + 5, clientY: before.top + 5, buttons: 1 }));
    window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: before.left + 25, clientY: before.top + 15, buttons: 1 }));
    expect(fixture.componentInstance.positions[1].x).not.toBe(4);
    child.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 2, buttons: 3 }));
    child.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 }));
    window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 0 }));
    fixture.detectChanges();
    expect(fixture.componentInstance.positions).toEqual(original);
    expect(child.getBoundingClientRect().left).toBeCloseTo(before.left, 0);
    expect(child.getBoundingClientRect().top).toBeCloseTo(before.top, 0);
    fixture.destroy();
  });

  it('constrains actual Shift dragging horizontally and resumes free movement without jumping', async () => {
    const fixture = TestBed.createComponent(BoundedHost);
    fixture.componentInstance.positions = [{ start: 0, length: 5, x: 30, y: 30, flip: 0 }];
    fixture.detectChanges();
    const fragment: HTMLElement = fixture.nativeElement.querySelector('.artifact-fragment');
    fragment.click();
    fixture.detectChanges();
    await new Promise<void>(resolve => setTimeout(resolve, 50));
    const before = fragment.getBoundingClientRect();
    fragment.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: before.left + 5, clientY: before.top + 5, button: 0, buttons: 1 }));
    window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: before.left + 35, clientY: before.top + 25, buttons: 1, shiftKey: true }));
    fixture.detectChanges();
    const moved = fragment.getBoundingClientRect();
    const guide: HTMLElement = fixture.nativeElement.querySelector('.horizontal-drag-guide');
    expect(guide).not.toBeNull();
    expect(getComputedStyle(guide).borderTopStyle).toBe('dashed');
    expect(getComputedStyle(guide).pointerEvents).toBe('none');
    expect(guide.getBoundingClientRect().top).toBeCloseTo((before.top + before.bottom) / 2, 0);
    expect(moved.left - before.left).toBeCloseTo(30, 0);
    expect(moved.top).toBeCloseTo(before.top, 0);
    window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: before.left + 40, clientY: before.top + 30, buttons: 1 }));
    fixture.detectChanges();
    const free = fragment.getBoundingClientRect();
    expect(free.left - moved.left).toBeCloseTo(5, 0);
    expect(free.top - moved.top).toBeCloseTo(5, 0);
    expect(fixture.nativeElement.querySelector('.horizontal-drag-guide')).toBeNull();
    window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: before.left + 500, clientY: before.top + 200, buttons: 1, shiftKey: true }));
    fixture.detectChanges();
    const edge = fragment.getBoundingClientRect();
    const bounds = fixture.nativeElement.querySelector('[style*="width: 200px"]').getBoundingClientRect() as DOMRect;
    expect(edge.right).toBeCloseTo(bounds.right, 0);
    expect(edge.top).toBeCloseTo(free.top, 0);
    expect(fixture.nativeElement.querySelector('.horizontal-drag-guide')).not.toBeNull();
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Shift', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.horizontal-drag-guide')).toBeNull();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift', bubbles: true, shiftKey: true }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.horizontal-drag-guide')).not.toBeNull();
    window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: before.left + 490, clientY: before.top + 200, buttons: 1, shiftKey: true }));
    fixture.detectChanges();
    expect(fragment.getBoundingClientRect().left).toBeCloseTo(edge.left - 10, 0);
    expect(fragment.getBoundingClientRect().top).toBeCloseTo(edge.top, 0);
    fragment.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: before.left + 490, clientY: before.top + 200, button: 0, shiftKey: true }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.horizontal-drag-guide')).toBeNull();
    fixture.destroy();
  });

  it('constrains Shift dragging to the image horizontal axis inside a rotated parent', async () => {
    const fixture = TestBed.createComponent(BoundedHost);
    fixture.componentInstance.positions = [
      { id: 'parent', start: 0, length: 5, x: 55, y: 30, flip: 30 },
      { id: 'child', parentId: 'parent', start: 1, length: 3, x: 4, y: 2, flip: 15 }
    ];
    fixture.detectChanges();
    const child: HTMLElement = fixture.nativeElement.querySelector('[data-fragment-index="1"]');
    child.click();
    fixture.detectChanges();
    await new Promise<void>(resolve => setTimeout(resolve, 50));
    const before = child.getBoundingClientRect();
    child.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: before.left + 5, clientY: before.top + 5, buttons: 1 }));
    window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: before.left + 35, clientY: before.top + 25, buttons: 1, shiftKey: true }));
    fixture.detectChanges();
    const after = child.getBoundingClientRect();
    expect(after.left - before.left).toBeCloseTo(30, 0);
    expect(after.top).toBeCloseTo(before.top, 0);
    expect(fixture.nativeElement.querySelector('.horizontal-drag-guide')).not.toBeNull();
    child.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: before.left + 35, clientY: before.top + 25, shiftKey: true }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.horizontal-drag-guide')).toBeNull();
    fixture.destroy();
  });

  it('keeps the width of a generated line while dragging it toward the right edge', async () => {
    const fixture = TestBed.createComponent(BoundedHost);
    fixture.detectChanges();
    const editor = fixture.debugElement.query(node => node.componentInstance instanceof ArtifactTextEditorComponent).componentInstance as ArtifactTextEditorComponent;
    editor.generateEdits('lines');
    fixture.detectChanges();
    expect(editor.error).toBe('');
    const fragment: HTMLElement = fixture.nativeElement.querySelector('.artifact-fragment');
    fragment.click();
    fixture.detectChanges();
    await new Promise<void>(resolve => setTimeout(resolve, 50));
    const before = fragment.getBoundingClientRect();
    const bounds: DOMRect = fixture.nativeElement.querySelector('[style*="width: 200px"]').getBoundingClientRect();
    fragment.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: before.left + 5, clientY: before.top + 5, button: 0, buttons: 1 }));
    window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: before.left + 180, clientY: before.top + 5, buttons: 1 }));
    fragment.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: before.left + 180, clientY: before.top + 5, button: 0 }));
    fixture.detectChanges();
    const after = fragment.getBoundingClientRect();
    expect(after.left).toBeGreaterThan(before.left);
    expect(after.width).toBeCloseTo(before.width, 1);
    expect(after.height).toBeCloseTo(before.height, 1);
    expect(after.right).toBeLessThanOrEqual(bounds.right + 0.1);
    expect(after.right).toBeCloseTo(bounds.right, 1);
    fixture.destroy();
  });

  it('preserves explicit wrapping width when moving a positioned edit', () => {
    const fixture = TestBed.createComponent(BoundedHost);
    fixture.componentInstance.positions = [{ start: 0, length: 12, x: 0, y: 0, flip: 0, width: 70 }];
    fixture.detectChanges();
    const editor = fixture.debugElement.query(node => node.componentInstance instanceof ArtifactTextEditorComponent).componentInstance as ArtifactTextEditorComponent;
    const fragment: HTMLElement = fixture.nativeElement.querySelector('.artifact-fragment');
    const before = fragment.getBoundingClientRect();
    editor.selectEdit(0);
    editor.onDrag({ left: 190, top: 0 });
    fixture.detectChanges();
    const after = fragment.getBoundingClientRect();
    expect(fragment.style.width).toBe('70px');
    expect(after.width).toBeCloseTo(before.width, 1);
    expect(after.height).toBeCloseTo(before.height, 1);
    expect(fixture.componentInstance.positions[0].x).toBeCloseTo(130, 1);
    fixture.destroy();
  });

  it('rejects font growth that would cross the edge instead of wrapping the text', () => {
    const fixture = TestBed.createComponent(BoundedHost);
    fixture.componentInstance.positions = [{ start: 0, length: 12, x: 90, y: 0, flip: 0, fontSize: 16 }];
    fixture.detectChanges();
    const editor = fixture.debugElement.query(node => node.componentInstance instanceof ArtifactTextEditorComponent).componentInstance as ArtifactTextEditorComponent;
    const fragment: HTMLElement = fixture.nativeElement.querySelector('.artifact-fragment');
    editor.selectEdit(0);
    editor.setFontSize(40);
    fixture.detectChanges();
    expect(editor.error).toContain('outside');
    expect(fixture.componentInstance.positions[0].fontSize).toBe(16);
    expect(fragment.style.fontSize).toBe('16px');
    fixture.destroy();
  });

  it('keeps the toolbar above the selection and stationary when increasing its font size', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.positions = [{ start: 0, length: 5, x: 60, y: 120, flip: 0, fontSize: 16 }];
    fixture.detectChanges();
    const fragment: HTMLElement = fixture.nativeElement.querySelector('.artifact-fragment');
    fragment.click();
    fixture.detectChanges();
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    fixture.detectChanges();
    const toolbar: HTMLElement = fixture.nativeElement.querySelector('.floating-toolbar');
    const input: HTMLInputElement = toolbar.querySelector('[aria-label="Font size in pixels"]')!;
    const before = input.getBoundingClientRect();
    expect(toolbar.getBoundingClientRect().bottom).toBeLessThan(fragment.getBoundingClientRect().top);

    input.value = '32';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    fixture.detectChanges();
    expect(fixture.componentInstance.positions[0].fontSize).toBe(32);
    expect(toolbar.getBoundingClientRect().bottom).toBeLessThan(fragment.getBoundingClientRect().top);
    expect(input.getBoundingClientRect().top).toBeCloseTo(before.top, 1);
    expect(input.getBoundingClientRect().left).toBeCloseTo(before.left, 1);
    fixture.destroy();
  });

  it('preserves wrapped and leading-blank lines when creating a whole-text edit', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.nativeElement.style.display = 'block';
    fixture.nativeElement.style.width = '100px';
    fixture.componentInstance.text = '\nfirst second third fourth fifth';
    fixture.componentInstance.language.direction = 'ltr';
    fixture.detectChanges();
    const text = fixture.nativeElement.querySelector('.baseline [data-segment-start]').firstChild as Text;
    const offsets = [1, 14, 26];
    const before = offsets.map(offset => {
      const range = document.createRange();
      range.setStart(text, offset);
      range.setEnd(text, offset + 1);
      return range.getBoundingClientRect();
    });
    const editor = fixture.debugElement.children[0].componentInstance as ArtifactTextEditorComponent;
    editor.generateEdits('text');
    fixture.detectChanges();
    expect(editor.error).toBe('');
    const result = fixture.nativeElement.querySelector('.artifact-fragment [data-segment-start]').firstChild as Text;
    offsets.forEach((offset, index) => {
      const range = document.createRange();
      range.setStart(result, offset);
      range.setEnd(result, offset + 1);
      const rect = range.getBoundingClientRect();
      expect(rect.left).toBeCloseTo(before[index].left, 1);
      expect(rect.top).toBeCloseTo(before[index].top, 1);
    });
    fixture.destroy();
  });

  it('preserves wrapped right-to-left text when creating a whole-text edit', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.nativeElement.style.display = 'block';
    fixture.nativeElement.style.width = '100px';
    fixture.componentInstance.text = 'אבגד הוזח טיכל מנסע פצקר';
    fixture.detectChanges();
    const node = fixture.nativeElement.querySelector('.baseline [data-segment-start]').firstChild as Text;
    const offsets = [0, 5, 10, 15, 20];
    const boxes = offsets.map(offset => {
      const range = document.createRange();
      range.setStart(node, offset);
      range.setEnd(node, offset + 1);
      return range.getBoundingClientRect();
    });
    const editor = fixture.debugElement.children[0].componentInstance as ArtifactTextEditorComponent;
    editor.generateEdits('text');
    fixture.detectChanges();
    expect(editor.error).toBe('');
    const result = fixture.nativeElement.querySelector('.artifact-fragment [data-segment-start]').firstChild as Text;
    offsets.forEach((offset, index) => {
      const range = document.createRange();
      range.setStart(result, offset);
      range.setEnd(result, offset + 1);
      const rect = range.getBoundingClientRect();
      expect(rect.left).toBeCloseTo(boxes[index].left, 1);
      expect(rect.top).toBeCloseTo(boxes[index].top, 1);
    });
    fixture.destroy();
  });

  it('creates one whole-text edit without moving lines in either reading direction', () => {
    for (const direction of ['ltr', 'rtl'] as const) {
      const fixture = TestBed.createComponent(Host);
      fixture.nativeElement.style.display = 'block';
      fixture.nativeElement.style.width = '300px';
      fixture.componentInstance.text = 'abcdef\nab';
      fixture.componentInstance.language.direction = direction;
      fixture.detectChanges();
      const node = fixture.nativeElement.querySelector('.baseline [data-segment-start]').firstChild as Text;
      const ranges = [0, 7].map(offset => {
        const range = document.createRange();
        range.setStart(node, offset);
        range.setEnd(node, offset + 1);
        return range.getBoundingClientRect();
      });
      fixture.nativeElement.querySelector('.edit-panel > button').click();
      fixture.detectChanges();
      const editor = fixture.debugElement.children[0].componentInstance as ArtifactTextEditorComponent;
      expect(editor.error).withContext(direction).toBe('');
      expect(fixture.componentInstance.positions.length).toBe(1);
      const newNode = fixture.nativeElement.querySelector('.artifact-fragment [data-segment-start]').firstChild as Text;
      [0, 7].forEach((offset, index) => {
        const range = document.createRange();
        range.setStart(newNode, offset);
        range.setEnd(newNode, offset + 1);
        const after = range.getBoundingClientRect();
        expect(after.left).withContext(direction).toBeCloseTo(ranges[index].left, 1);
        expect(after.top).withContext(direction).toBeCloseTo(ranges[index].top, 1);
      });
      fixture.destroy();
    }
  });

  it('creates line edits at their original locations, skips blank lines and preserves UTF-16 offsets', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.text = 'ab😀\n\ncd\n';
    fixture.componentInstance.language.direction = 'ltr';
    fixture.nativeElement.style.display = 'block';
    fixture.nativeElement.style.width = '300px';
    fixture.detectChanges();
    const editor = fixture.debugElement.children[0].componentInstance as ArtifactTextEditorComponent;
    const text = fixture.nativeElement.querySelector('.baseline [data-segment-start]').firstChild as Text;
    const first = document.createRange();
    first.setStart(text, 0);
    first.setEnd(text, 1);
    const second = document.createRange();
    second.setStart(text, 6);
    second.setEnd(text, 7);
    const before = [first.getBoundingClientRect(), second.getBoundingClientRect()];
    const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('.edit-panel > button');
    buttons[1].click();
    fixture.detectChanges();
    expect(editor.error).toBe('');
    expect(fixture.componentInstance.positions.map(item => [item.start, item.length])).toEqual([[0, 4], [6, 2]]);
    for (let index = 0; index < 2; index++) {
      const element: HTMLElement = fixture.nativeElement.querySelector(`[data-fragment-index="${index}"] [data-segment-start]`);
      const afterRange = document.createRange();
      afterRange.setStart(element.firstChild!, 0);
      afterRange.setEnd(element.firstChild!, 1);
      const after = afterRange.getBoundingClientRect();
      expect(after.left).toBeCloseTo(before[index].left, 1);
      expect(after.top).toBeCloseTo(before[index].top, 1);
    }
    fixture.destroy();
  });

  it('wraps existing rotated edits in the whole-text edit without moving them', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.nativeElement.style.display = 'block';
    fixture.nativeElement.style.width = '300px';
    fixture.componentInstance.positions = [{ id: 'existing', start: 6, length: 6, x: 90, y: 30, flip: 25, fontSize: 24 }];
    fixture.detectChanges();
    const before = fixture.nativeElement.querySelector('[data-fragment-index="0"]').getBoundingClientRect() as DOMRect;
    fixture.nativeElement.querySelector('.edit-panel > button').click();
    fixture.detectChanges();
    const editor = fixture.debugElement.children[0].componentInstance as ArtifactTextEditorComponent;
    expect(editor.error).toBe('');
    expect(fixture.componentInstance.positions.length).toBe(2);
    const child = fixture.componentInstance.positions[0];
    expect(child.parentId).toBe(fixture.componentInstance.positions[1].id);
    expect(child.flip).toBe(25);
    expect(child.fontSize).toBe(24);
    const after = fixture.nativeElement.querySelector('[data-fragment-index="0"]').getBoundingClientRect() as DOMRect;
    expect(after.left).toBeCloseTo(before.left, 1);
    expect(after.top).toBeCloseTo(before.top, 1);
    fixture.destroy();
  });

  it('does not alter existing edits that cross a line boundary', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.text = 'abc\ndef';
    fixture.componentInstance.positions = [{ start: 2, length: 3, x: 10, y: 10, flip: 0 }];
    fixture.detectChanges();
    const original = JSON.parse(JSON.stringify(fixture.componentInstance.positions));
    const editor = fixture.debugElement.children[0].componentInstance as ArtifactTextEditorComponent;
    editor.generateEdits('lines');
    expect(editor.error).toContain('crosses a line boundary');
    expect(fixture.componentInstance.positions).toEqual(original);
    fixture.destroy();
  });

  it('creates line edits inside an existing whole-text edit without moving the text', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.nativeElement.style.display = 'block';
    fixture.nativeElement.style.width = '300px';
    fixture.componentInstance.text = 'abcd\nefgh';
    fixture.componentInstance.language.direction = 'ltr';
    fixture.detectChanges();
    const editor = fixture.debugElement.children[0].componentInstance as ArtifactTextEditorComponent;
    editor.generateEdits('text');
    fixture.detectChanges();
    const whole = fixture.componentInstance.positions[0];
    const text = fixture.nativeElement.querySelector('[data-fragment-index="0"] [data-segment-start]').firstChild as Text;
    const before = [0, 5].map(offset => {
      const range = document.createRange();
      range.setStart(text, offset);
      range.setEnd(text, offset + 1);
      return range.getBoundingClientRect();
    });
    editor.generateEdits('lines');
    fixture.detectChanges();
    expect(editor.error).toBe('');
    expect(fixture.componentInstance.positions.length).toBe(3);
    for (let index = 1; index < 3; index++) {
      expect(fixture.componentInstance.positions[index].parentId).toBe(whole.id);
      const node = fixture.nativeElement.querySelector(`[data-fragment-index="${index}"] [data-segment-start]`).firstChild as Text;
      const range = document.createRange();
      range.setStart(node, 0);
      range.setEnd(node, 1);
      const rect = range.getBoundingClientRect();
      expect(rect.left).toBeCloseTo(before[index - 1].left, 1);
      expect(rect.top).toBeCloseTo(before[index - 1].top, 1);
    }
    fixture.destroy();
  });

  it('creates line edits inside a rotated and formatted parent without moving existing nested edits', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.nativeElement.style.display = 'block';
    fixture.nativeElement.style.width = '300px';
    fixture.componentInstance.text = 'abcd\nefgh';
    fixture.componentInstance.positions = [
      { id: 'parent', start: 0, length: 9, x: 80, y: 30, flip: 25, fontSize: 24 },
      { id: 'child', parentId: 'parent', start: 1, length: 2, x: 8, y: 3, flip: 10 }
    ];
    fixture.detectChanges();
    const child: HTMLElement = fixture.nativeElement.querySelector('[data-fragment-index="1"]');
    const before = child.getBoundingClientRect();
    const editor = fixture.debugElement.children[0].componentInstance as ArtifactTextEditorComponent;
    editor.generateEdits('lines');
    fixture.detectChanges();
    expect(editor.error).toBe('');
    expect(fixture.componentInstance.positions.length).toBe(4);
    expect(fixture.componentInstance.positions[1].parentId).toBe(fixture.componentInstance.positions[2].id);
    const after = (fixture.nativeElement.querySelector('[data-fragment-index="1"]') as HTMLElement).getBoundingClientRect();
    expect(after.left).toBeCloseTo(before.left, 1);
    expect(after.top).toBeCloseTo(before.top, 1);
    expect(after.width).toBeCloseTo(before.width, 1);
    expect(after.height).toBeCloseTo(before.height, 1);
    fixture.destroy();
  });

  it('leaves edits unchanged when generated text does not fit the fragment', () => {
    const fixture = TestBed.createComponent(BoundedHost);
    fixture.componentInstance.positions = [];
    fixture.detectChanges();
    const editor = fixture.debugElement.query(node => node.componentInstance instanceof ArtifactTextEditorComponent).componentInstance as ArtifactTextEditorComponent;
    const bounds: HTMLElement = fixture.nativeElement.querySelector('[style*="width: 200px"]');
    bounds.style.width = '10px';
    bounds.style.height = '10px';
    editor.generateEdits('text');
    expect(editor.error).toContain('outside');
    expect(fixture.componentInstance.positions).toEqual([]);
    fixture.destroy();
  });

  it('shows edit positions on buttons and the displayed text in their titles', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.positions = [
      { start: 0, length: 5, x: 1, y: 2, flip: 0 },
      { start: 6, length: 6, x: 3, y: 4, flip: 0 }
    ];
    fixture.detectChanges();

    const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('.edit-panel li button:first-of-type');
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent?.trim()).toBe('0 + 5');
    expect(buttons[0].title).toBe('FIRST');
    expect(buttons[1].textContent?.trim()).toBe('6 + 6');
    expect(buttons[1].title).toBe('SECOND');
    buttons[1].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-fragment-index="1"]').classList.contains('selected')).toBeTrue();
    fixture.destroy();
  });

  it('aligns the unpositioned transcription to the left for both reading directions', () => {
    for (const direction of ['rtl', 'ltr'] as const) {
      const fixture = TestBed.createComponent(Host);
      fixture.nativeElement.style.display = 'block';
      fixture.nativeElement.style.width = '300px';
      fixture.componentInstance.language = { name: 'Test', label: 'test', direction };
      fixture.detectChanges();

      const canvas: HTMLElement = fixture.nativeElement.querySelector('.artifact-canvas');
      const baseline: HTMLElement = fixture.nativeElement.querySelector('.baseline');
      const range = document.createRange();
      range.selectNodeContents(baseline);
      expect(canvas.getAttribute('dir')).toBe(direction);
      expect(range.getBoundingClientRect().left).toBeCloseTo(canvas.getBoundingClientRect().left, 0);
      fixture.destroy();
    }
  });

  it('creates a selection and formats it using the floating toolbar', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const editor = fixture.debugElement.children[0].componentInstance as ArtifactTextEditorComponent;
    const text = fixture.nativeElement.querySelector('[data-segment-start]').firstChild as Text;
    const range = document.createRange();
    range.setStart(text, 6);
    range.setEnd(text, 12);
    window.getSelection()!.removeAllRanges();
    window.getSelection()!.addRange(range);
    editor.selectCanvasText();
    fixture.detectChanges();
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    fixture.detectChanges();
    const fragment: HTMLElement = fixture.nativeElement.querySelector('.artifact-fragment');
    expect(fragment.textContent).toBe('SECOND');
    expect(fragment.classList.contains('selected')).toBeTrue();
    expect(fixture.nativeElement.querySelector('.artifact-canvas').getAttribute('dir')).toBe('rtl');
    expect(fixture.nativeElement.querySelector('.artifact-canvas').style.fontFamily).toBe('serif');
    expect(fixture.nativeElement.querySelector('.floating-toolbar')).not.toBeNull();
    const size: HTMLInputElement = fixture.nativeElement.querySelector('[aria-label="Font size in pixels"]');
    size.value = '24';
    size.dispatchEvent(new Event('input'));
    const spacing: HTMLInputElement = fixture.nativeElement.querySelector('[aria-label="Letter spacing in pixels"]');
    spacing.value = '3';
    spacing.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fragment.style.fontSize).toBe('24px');
    expect(fragment.style.letterSpacing).toBe('3px');
    expect(fixture.componentInstance.positions[0].fontSize).toBe(24);
    expect(fixture.componentInstance.positions[0].letterSpacing).toBe(3);
    fixture.destroy();
  });

  it('selects before deletion and keeps the edit when deletion is cancelled', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.positions = [{ start: 0, length: 5, x: 1, y: 2, flip: 0 }];
    fixture.detectChanges();
    const editor = fixture.debugElement.children[0].componentInstance as ArtifactTextEditorComponent;
    editor.requestDelete(0);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.artifact-fragment.selected').textContent).toBe('FIRST');
    expect(fixture.nativeElement.querySelector('.delete-confirmation').textContent).toContain('FIRST');
    expect(fixture.componentInstance.positions.length).toBe(1);
    editor.cancelDelete();
    expect(fixture.componentInstance.positions.length).toBe(1);
    editor.requestDelete(0);
    editor.confirmDelete();
    fixture.detectChanges();
    expect(fixture.componentInstance.positions).toEqual([]);
    expect(fixture.nativeElement.querySelector('.artifact-fragment')).toBeNull();
  });

  it('moves and rotates the selected fragment and emits its new position', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.positions = [{ start: 0, length: 5, x: 1, y: 2, flip: 15 }];
    fixture.detectChanges();
    const editor = fixture.debugElement.children[0].componentInstance as ArtifactTextEditorComponent;
    editor.selectEdit(0);
    editor.onDrag({ left: 44, top: 55 });
    editor.onRotate({ rotation: 40 });
    fixture.detectChanges();
    expect(fixture.componentInstance.positions[0]).toEqual({ start: 0, length: 5, x: 44, y: 55, flip: 40 });
    expect(editor.rotationPositions.length).toBe(4);
    expect(fixture.nativeElement.querySelector('.artifact-fragment').style.transform).toBe('rotate(40deg)');
  });

  it('drags a selected fragment with mouse gestures and renders rotation handles', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.positions = [{ start: 0, length: 5, x: 60, y: 80, flip: 0 }];
    fixture.detectChanges();
    const fragment: HTMLElement = fixture.nativeElement.querySelector('.artifact-fragment');
    fragment.click();
    fixture.detectChanges();
    await new Promise<void>(resolve => setTimeout(resolve, 50));
    fixture.detectChanges();
    expect(getComputedStyle(fragment).cursor).toBe('grab');
    expect(getComputedStyle(fixture.nativeElement.querySelector('.moveable-rotation-control')).cursor).toContain('data:image/svg+xml');
    const rect = fragment.getBoundingClientRect();
    fragment.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: rect.left + 5, clientY: rect.top + 5, button: 0, buttons: 1 }));
    window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: rect.left + 20, clientY: rect.top + 15, buttons: 1 }));
    fixture.detectChanges();
    window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: rect.left + 35, clientY: rect.top + 25, buttons: 1 }));
    fragment.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, clientX: rect.left + 35, clientY: rect.top + 25, button: 0 }));
    fixture.detectChanges();
    expect(fixture.componentInstance.positions[0].x).toBeCloseTo(90, 0);
    expect(fixture.componentInstance.positions[0].y).toBeCloseTo(100, 0);
    window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: rect.left + 65, clientY: rect.top + 45, buttons: 0 }));
    fixture.detectChanges();
    expect(fixture.componentInstance.positions[0].x).toBeCloseTo(90, 0);
    expect(fixture.componentInstance.positions[0].y).toBeCloseTo(100, 0);
    expect(fixture.nativeElement.querySelectorAll('.moveable-rotation').length).toBeGreaterThanOrEqual(4);
    await new Promise<void>(resolve => setTimeout(resolve, 50));
    const handle: HTMLElement = fixture.nativeElement.querySelector('.moveable-rotation-control');
    const handleRect = handle.getBoundingClientRect();
    const hx = handleRect.left + handleRect.width / 2;
    const hy = handleRect.top + handleRect.height / 2;
    handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: hx, clientY: hy, buttons: 1 }));
    window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: hx + 30, clientY: hy + 30, buttons: 1 }));
    window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: hx + 30, clientY: hy + 30 }));
    fixture.detectChanges();
    expect(Math.abs(fixture.componentInstance.positions[0].flip)).toBeGreaterThan(1);
    const before = { ...fixture.componentInstance.positions[0] };
    const rotated = fragment.getBoundingClientRect();
    fragment.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: rotated.left + 5, clientY: rotated.top + 5, buttons: 1 }));
    window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: rotated.left + 25, clientY: rotated.top + 15, buttons: 1 }));
    window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: rotated.left + 25, clientY: rotated.top + 15 }));
    fixture.detectChanges();
    expect(fixture.componentInstance.positions[0].x).toBeCloseTo(before.x + 20, 0);
    expect(fixture.componentInstance.positions[0].y).toBeCloseTo(before.y + 10, 0);
    fixture.destroy();
  });

  it('snaps rotation with Shift during the gesture and restores free rotation when released', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.positions = [{ start: 0, length: 5, x: 60, y: 80, flip: 17 }];
    fixture.detectChanges();
    const fragment: HTMLElement = fixture.nativeElement.querySelector('.artifact-fragment');
    fragment.click();
    fixture.detectChanges();
    await new Promise<void>(resolve => setTimeout(resolve, 50));
    const handle: HTMLElement = fixture.nativeElement.querySelector('.moveable-rotation-control');
    const rect = handle.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const box = fragment.getBoundingClientRect();
    const centerX = box.left + box.width / 2;
    const centerY = box.top + box.height / 2;
    const radians = -17 * Math.PI / 180;
    const straightX = centerX + (x - centerX) * Math.cos(radians) - (y - centerY) * Math.sin(radians);
    const straightY = centerY + (x - centerX) * Math.sin(radians) + (y - centerY) * Math.cos(radians);
    handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: x, clientY: y, buttons: 1 }));
    window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: straightX, clientY: straightY, buttons: 1, shiftKey: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.positions[0].flip).toBeCloseTo(0, 5);
    window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: x + 20, clientY: y + 10, buttons: 1, shiftKey: true }));
    fixture.detectChanges();
    const snapped = fixture.componentInstance.positions[0].flip;
    expect(snapped / 45).toBeCloseTo(Math.round(snapped / 45), 5);
    window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: x + 23, clientY: y + 10, buttons: 1 }));
    fixture.detectChanges();
    const free = fixture.componentInstance.positions[0].flip;
    expect(Math.abs(free / 45 - Math.round(free / 45))).toBeGreaterThan(0.001);
    const expected = 17 + (Math.atan2(y + 10 - centerY, x + 23 - centerX) -
      Math.atan2(y - centerY, x - centerX)) * 180 / Math.PI;
    expect(free).toBeCloseTo(expected, 0);
    handle.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: x + 23, clientY: y + 10 }));
    window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: x + 50, clientY: y + 20, buttons: 0 }));
    fixture.detectChanges();
    expect(fixture.componentInstance.positions[0].flip).toBe(free);
    fixture.destroy();
  });

  it('snaps nested edits to visible 45-degree angles', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.positions = [
      { id: 'parent', start: 0, length: 5, x: 0, y: 0, flip: 20 },
      { parentId: 'parent', start: 1, length: 2, x: 0, y: 0, flip: 0 },
    ];
    fixture.detectChanges();
    const editor = fixture.debugElement.children[0].componentInstance as ArtifactTextEditorComponent;
    editor.selectEdit(1);
    const setRotation = jasmine.createSpy('setRotation');
    editor.onBeforeRotate({ rotation: -12, inputEvent: new MouseEvent('mousemove', { shiftKey: true }), setRotation });
    expect(setRotation).toHaveBeenCalledOnceWith(-20);
    editor.onBeforeRotate({ rotation: 40, inputEvent: new MouseEvent('mousemove'), setRotation });
    expect(setRotation).toHaveBeenCalledTimes(1);
    fixture.destroy();
  });

  it('rejects overlapping selections', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.positions = [{ start: 0, length: 5, x: 1, y: 2, flip: 0 }];
    fixture.detectChanges();
    const editor = fixture.debugElement.children[0].componentInstance as ArtifactTextEditorComponent;
    editor.draft = { start: 3, length: 4, x: 0, y: 0, flip: 0 };
    editor.saveEdit();
    expect(editor.error).toContain('disjoint');
    expect(fixture.componentInstance.positions.length).toBe(1);
  });

  it('deselects on outside clicks without dismissing controls when using the toolbar', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.positions = [{ start: 0, length: 5, x: 1, y: 2, flip: 0 }];
    fixture.detectChanges();
    const fragment: HTMLElement = fixture.nativeElement.querySelector('.artifact-fragment');
    fragment.click();
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.floating-toolbar input') as HTMLElement).click();
    fixture.detectChanges();
    expect(fragment.classList.contains('selected')).toBeTrue();
    document.body.click();
    fixture.detectChanges();
    expect(fragment.classList.contains('selected')).toBeFalse();
    expect(fixture.nativeElement.querySelector('.floating-toolbar')).toBeNull();
    fixture.destroy();
  });

  it('selects and customizes a subsection of positioned text and preserves it when the parent is deleted', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.positions = [{ start: 0, length: 5, x: 80, y: 100, flip: 25, fontSize: 30, letterSpacing: 2 }];
    fixture.detectChanges();
    const editor = fixture.debugElement.children[0].componentInstance as ArtifactTextEditorComponent;
    const fragment: HTMLElement = fixture.nativeElement.querySelector('.artifact-fragment');
    fragment.click();
    fixture.detectChanges();
    editor.selectPart();
    fixture.detectChanges();
    const text = fragment.querySelector('[data-segment-start]')!.firstChild!;
    const range = document.createRange();
    range.setStart(text, 1);
    range.setEnd(text, 4);
    window.getSelection()!.removeAllRanges();
    window.getSelection()!.addRange(range);
    fragment.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    fixture.detectChanges();
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    fixture.detectChanges();
    expect(fixture.componentInstance.positions.length).toBe(2);
    expect(fixture.componentInstance.positions[1].parentId).toBe(fixture.componentInstance.positions[0].id);
    expect(fixture.componentInstance.positions[1].start).toBe(1);
    const child: HTMLElement = fixture.nativeElement.querySelector('[data-fragment-index="1"]');
    expect(child.textContent?.trim()).toBe('IRS');
    expect(editor.selectedIndex).toBe(1);
    editor.setFontSize(40);
    fixture.detectChanges();
    expect(fixture.componentInstance.positions[0].fontSize).toBe(30);
    expect(fixture.componentInstance.positions[1].fontSize).toBe(40);
    await new Promise<void>(resolve => setTimeout(resolve, 50));
    const childBox = child.getBoundingClientRect();
    const beforeDrag = { ...fixture.componentInstance.positions[1] };
    child.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: childBox.left + 5, clientY: childBox.top + 5, buttons: 1 }));
    window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: childBox.left + 25, clientY: childBox.top + 15, buttons: 1 }));
    window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: childBox.left + 25, clientY: childBox.top + 15 }));
    fixture.detectChanges();
    expect(fixture.componentInstance.positions[1].x).not.toBe(beforeDrag.x);
    expect(fixture.componentInstance.positions[0].x).toBe(80);
    const dragged = child.getBoundingClientRect();
    expect(dragged.left - childBox.left).toBeCloseTo(20, 0);
    expect(dragged.top - childBox.top).toBeCloseTo(10, 0);
    const before = child.getBoundingClientRect();
    editor.requestDelete(0);
    fixture.detectChanges();
    editor.confirmDelete();
    fixture.detectChanges();
    const remaining = fixture.nativeElement.querySelector('[data-fragment-index="0"]') as HTMLElement;
    const after = remaining.getBoundingClientRect();
    expect(fixture.componentInstance.positions.length).toBe(1);
    expect(fixture.componentInstance.positions[0].parentId).toBeUndefined();
    expect(fixture.componentInstance.positions[0].flip).toBe(25);
    expect(fixture.componentInstance.positions[0].fontSize).toBe(40);
    expect(after.left).toBeCloseTo(before.left, 0);
    expect(after.top).toBeCloseTo(before.top, 0);
    fixture.destroy();
  });

  it('confirms deletion of checked edits and all edits without changing data on cancellation', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.positions = [
      { start: 0, length: 5, x: 1, y: 2, flip: 0 },
      { start: 6, length: 6, x: 3, y: 4, flip: 0 }
    ];
    fixture.detectChanges();
    const editor = fixture.debugElement.children[0].componentInstance as ArtifactTextEditorComponent;
    const checkbox: HTMLInputElement = fixture.nativeElement.querySelector('input[type="checkbox"]');
    checkbox.click();
    fixture.detectChanges();
    editor.requestBulkDelete(false);
    fixture.detectChanges();
    expect(editor.pendingDeletion).toEqual([0]);
    expect(fixture.nativeElement.querySelector('.artifact-fragment.selected')).not.toBeNull();
    editor.cancelDelete();
    expect(fixture.componentInstance.positions.length).toBe(2);
    editor.requestBulkDelete(false);
    editor.confirmDelete();
    fixture.detectChanges();
    expect(fixture.componentInstance.positions.length).toBe(1);
    expect(fixture.componentInstance.positions[0].start).toBe(6);
    expect(editor.checked.size).toBe(0);
    editor.requestBulkDelete(true);
    editor.confirmDelete();
    fixture.detectChanges();
    expect(fixture.componentInstance.positions).toEqual([]);
    fixture.destroy();
  });

  it('limits dragging on every edge, including rotated text', () => {
    const fixture = TestBed.createComponent(BoundedHost);
    fixture.componentInstance.positions = [{ start: 0, length: 5, x: 80, y: 40, flip: 25 }];
    fixture.detectChanges();
    const editor = fixture.debugElement.query(node => node.componentInstance instanceof ArtifactTextEditorComponent).componentInstance as ArtifactTextEditorComponent;
    editor.selectEdit(0);
    fixture.detectChanges();
    const bounds: HTMLElement = fixture.nativeElement.querySelector('[style*="width: 200px"]');
    const text: HTMLElement = fixture.nativeElement.querySelector('.artifact-fragment');
    for (const [x, y] of [[-300, -300], [500, 500], [500, -300], [-300, 500]]) {
      editor.onDrag({ left: x, top: y });
      fixture.detectChanges();
      const rect = text.getBoundingClientRect();
      const limit = bounds.getBoundingClientRect();
      expect(rect.left).toBeGreaterThanOrEqual(limit.left - 0.1);
      expect(rect.top).toBeGreaterThanOrEqual(limit.top - 0.1);
      expect(rect.right).toBeLessThanOrEqual(limit.right + 0.1);
      expect(rect.bottom).toBeLessThanOrEqual(limit.bottom + 0.1);
    }
    fixture.destroy();
  });

  it('constrains a real drag of rotated nested text', async () => {
    const fixture = TestBed.createComponent(BoundedHost);
    fixture.componentInstance.positions = [
      { id: 'parent', start: 0, length: 5, x: 70, y: 30, flip: 25 },
      { id: 'child', parentId: 'parent', start: 1, length: 3, x: 5, y: 5, flip: 15 }
    ];
    fixture.detectChanges();
    const child: HTMLElement = fixture.nativeElement.querySelector('[data-fragment-index="1"]');
    child.click();
    fixture.detectChanges();
    await new Promise<void>(resolve => setTimeout(resolve, 50));
    const before = child.getBoundingClientRect();
    child.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: before.left + 5, clientY: before.top + 5, buttons: 1 }));
    window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: before.left + 500, clientY: before.top + 500, buttons: 1 }));
    child.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: before.left + 500, clientY: before.top + 500 }));
    fixture.detectChanges();
    const bounds: DOMRect = fixture.nativeElement.querySelector('[style*="width: 200px"]').getBoundingClientRect();
    const after = child.getBoundingClientRect();
    expect(after.left).toBeGreaterThanOrEqual(bounds.left - 0.1);
    expect(after.top).toBeGreaterThanOrEqual(bounds.top - 0.1);
    expect(after.right).toBeLessThanOrEqual(bounds.right + 0.1);
    expect(after.bottom).toBeLessThanOrEqual(bounds.bottom + 0.1);
    expect(after.left).toBeGreaterThan(before.left);
    fixture.destroy();
  });

  it('rejects rotation and font changes that would leave the bounds', () => {
    const fixture = TestBed.createComponent(BoundedHost);
    fixture.componentInstance.positions = [{ start: 0, length: 5, x: 0, y: 0, flip: 0 }];
    fixture.detectChanges();
    const editor = fixture.debugElement.query(node => node.componentInstance instanceof ArtifactTextEditorComponent).componentInstance as ArtifactTextEditorComponent;
    editor.selectEdit(0);
    editor.onRotate({ rotation: 90 });
    expect(fixture.componentInstance.positions[0].flip).toBe(0);
    expect(editor.error).toContain('outside');
    editor.setFontSize(500);
    expect(fixture.componentInstance.positions[0].fontSize).toBeUndefined();
    expect(editor.error).toContain('outside');
    fixture.destroy();
  });

  it('validates form positions without changing the displayed or saved transcription', () => {
    const fixture = TestBed.createComponent(BoundedHost);
    fixture.componentInstance.positions = [{ start: 0, length: 5, x: 5, y: 5, flip: 0 }];
    fixture.detectChanges();
    const editor = fixture.debugElement.query(node => node.componentInstance instanceof ArtifactTextEditorComponent).componentInstance as ArtifactTextEditorComponent;
    expect(editor.validatePositions('First second', [{ start: 0, length: 5, x: 190, y: 5, flip: 0 }])).toContain('outside');
    expect(editor.validatePositions('First second', [{ start: 0, length: 5, x: 10, y: 5, flip: 0 }])).toBeNull();
    expect(fixture.componentInstance.positions[0].x).toBe(5);
    expect((fixture.nativeElement.querySelector('.artifact-fragment') as HTMLElement).style.left).toBe('5px');
    fixture.destroy();
  });

  it('restores the selected text and controls after validating a different transcription', () => {
    const fixture = TestBed.createComponent(BoundedHost);
    fixture.componentInstance.positions = [
      { id: 'parent', start: 0, length: 5, x: 30, y: 20, flip: 0 },
      { id: 'child', parentId: 'parent', start: 1, length: 3, x: 3, y: 2, flip: 0 }
    ];
    fixture.detectChanges();
    const editor = fixture.debugElement.query(node => node.componentInstance instanceof ArtifactTextEditorComponent).componentInstance as ArtifactTextEditorComponent;
    editor.selectEdit(1);
    fixture.detectChanges();
    expect(editor.validatePositions('Other', [{ start: 0, length: 5, x: 10, y: 10, flip: 0 }])).toBeNull();
    fixture.detectChanges();
    const child: HTMLElement = fixture.nativeElement.querySelector('[data-fragment-index="1"]');
    expect(editor.selectedElement).toBe(child);
    expect(child.textContent?.trim()).toBe('irs');
    editor.setFontSize(20);
    fixture.detectChanges();
    expect(child.style.fontSize).toBe('20px');
    fixture.destroy();
  });
});
